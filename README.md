
# Digikala Product Reviews Scraper

This project is a web scraping tool for extracting and saving product reviews from Digikala using its public API. It allows you to fetch product reviews by parsing product URLs and saves the data in an Excel file. The project supports pagination, so it can collect reviews from multiple pages.

## Features

- Extracts product reviews from Digikala using product URLs.
- Supports paginated fetching of reviews.
- Saves extracted data (reviewer name, rating, comment, and more) to an Excel file.
## Requirements

- Node.js v14+ (or newer)
- npm (Node Package Manager)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/MohamadrezaKazemian/digikala-reviews-scraper.git
cd digikala-reviews-scraper
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the application

Make sure to modify the `productLink` in the code with a valid Digikala product URL before running the scraper.

```bash
npm start
```

## Usage

### Input

- Update the `productLink` variable with the URL of the Digikala product for which you want to scrape reviews.
  
For example:

```typescript
const productLink = "https://www.digikala.com/product/dkp-4170599/...";
```

### Output

The extracted data (reviews) will be saved in an Excel file in the project directory.

### Example Excel Fields:

- **Username**: Name of the user who posted the review.
- **Created At**: The date the review was posted.
- **Comment**: The body of the review.
- **Rate**: The rating given by the user.
- **Is Buyer**: Whether the user is a verified buyer.
- **Recommendation Status**: Whether the user recommends the product.

## Configuration

The project uses TypeScript for type checking and includes the following configuration files:

- `tsconfig.json`: TypeScript configuration.
- `package.json`: Defines project scripts and dependencies.

## File Structure

```
├── src/                    # Main source code for the scraper
├── package.json            # Project metadata and npm dependencies
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file
```

## Contributing

Feel free to open an issue or submit a pull request if you find bugs or want to contribute.

