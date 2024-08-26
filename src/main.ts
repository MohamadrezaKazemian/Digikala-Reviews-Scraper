import axios from "axios";
import * as XLSX from "xlsx";
import fs from "fs";

// Extract the product ID from the product link using a regular expression
const productLink =
  "https://www.digikala.com/product/dkp-8366616/%DA%AF%D9%88%D8%B4%DB%8C-%D9%85%D9%88%D8%A8%D8%A7%DB%8C%D9%84-%D8%A7%D9%BE%D9%84-%D9%85%D8%AF%D9%84-iphone-13-ch-%D8%AF%D9%88-%D8%B3%DB%8C%D9%85-%DA%A9%D8%A7%D8%B1%D8%AA-%D8%B8%D8%B1%D9%81%DB%8C%D8%AA-128-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D9%88-%D8%B1%D9%85-4-%DA%AF%DB%8C%DA%AF%D8%A7%D8%A8%D8%A7%DB%8C%D8%AA-%D9%86%D8%A7%D8%AA-%D8%A7%DA%A9%D8%AA%DB%8C%D9%88/";
const productIdRegex = /dkp-(\d+)/;
const productIdMatch = productLink.match(productIdRegex);

// Base URL for the API
let apiBaseUrl = "";

// Check if a valid product ID was extracted from the URL
if (productIdMatch && productIdMatch[1]) {
  const productId = productIdMatch[1];
  apiBaseUrl = `https://api.digikala.com/v1/rate-review/products/${productId}/`;
  console.log(`API Base URL: ${apiBaseUrl}`);
} else {
  console.error("Product ID not found in the provided URL.");
  process.exit(1); // Exit the program if no product ID is found
}

// Array to collect all API responses
const allResponses: any[] = [];

/**
 * Fetches data for a specific page and stores it in the allResponses array.
 * @param {number} pageNumber - The page number to fetch.
 * @param {number} [retryCount=0] - The number of retry attempts made.
 * @returns {Promise<number>} - The total number of pages.
 */
async function fetchAndSavePage(
  pageNumber: number,
  retryCount = 0
): Promise<number> {
  const url = `${apiBaseUrl}?page=${pageNumber}`;
  try {
    const response = await axios.get(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        "x-web-client": "desktop",
        "x-web-optimize-response": "1",
      },
    });

    const { data } = response.data;

    if (!data || !data.comments || data.comments.length === 0) {
      console.log(`No comments found on page ${pageNumber}. Stopping.`);
      return 0; // Stop further fetching
    }

    // Collect the response data
    allResponses.push(data);
    console.log(`Data for page ${pageNumber} saved successfully.`);

    // Check if `pager` exists before accessing it
    if (data.pager && data.pager.total_pages) {
      return data.pager.total_pages;
    } else {
      console.warn(
        `No pager information found for page ${pageNumber}. Stopping.`
      );
      return 0; // Stop fetching if pager is missing
    }
  } catch (error) {
    console.error(`Error fetching data for page ${pageNumber}:`, error);

    // Retry up to 3 times with delay if an error occurs
    if (retryCount < 3) {
      console.log(`Retrying page ${pageNumber}... (${retryCount + 1}/3)`);
      return fetchAndSavePage(pageNumber, retryCount + 1);
    }

    console.error(
      `Failed to fetch data for page ${pageNumber} after 3 retries.`
    );
    return 0; // Stop fetching after max retries
  }
}

/**
 * Fetches all pages of the product reviews and saves them into an Excel file.
 */
async function fetchAllPages(): Promise<void> {
  // Fetch the first page to get the total number of pages
  const totalPages = await fetchAndSavePage(1);
  if (totalPages === 0) {
    console.log("Failed to fetch any data.");
    return;
  }

  // Fetch the remaining pages, but stop if the page number exceeds 101
  for (let page = 2; page <= Math.min(totalPages, 101); page++) {
    await fetchAndSavePage(page);
  }

  // Once all pages are fetched, create and save the Excel file
  createExcelFile(allResponses);
}

/**
 * Creates an Excel file from the fetched comments and saves it to disk.
 * @param {any[]} data - The array containing all the fetched data.
 */
function createExcelFile(data: any[]): void {
  // Extract and format the desired fields from the comments data
  const formattedData = data.flatMap((page) =>
    page.comments.map((comment: any) => ({
      user_name: comment.user_name,
      created_at: comment.created_at,
      comment_body: comment?.body,
      rating: comment.rate,
      is_buyer: comment.is_buyer,
      recommendation_status: comment.recommendation_status,
    }))
  );

  // Create a worksheet from the formatted data
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Comments");

  // Generate a unique file name using a timestamp if the file already exists
  const fileName = generateUniqueFileName("comments.xlsx");

  // Write the workbook to a file
  XLSX.writeFile(workbook, fileName);

  console.log(`Excel file saved as ${fileName}`);
}

/**
 * Generates a unique file name by appending a timestamp if the file already exists.
 * @param {string} baseFileName - The base file name to check.
 * @returns {string} - The generated unique file name.
 */
function generateUniqueFileName(baseFileName: string): string {
  let fileName = baseFileName;
  let counter = 1;

  // Check if the file exists, if so append a timestamp
  while (fs.existsSync(fileName)) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    fileName = `comments-${timestamp}.xlsx`;
    counter++;
  }

  return fileName;
}

// Start the data fetching process if the base URL is set
if (apiBaseUrl) {
  fetchAllPages();
}
