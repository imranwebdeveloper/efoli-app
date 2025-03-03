# Shopify Collections App

This project is a Shopify app that allows merchants to create and manage custom collections of products within their Shopify store. Merchants can organize their products into collections with names, optional priority levels, and associated products.

## Video Demonstration

- [Video demonstration of the app](https://drive.google.com/file/d/1AdzyOKmadcTEnx_mLZcLb0jJCOedbLkG/view?usp=drive_link)
- Video Link : https://drive.google.com/file/d/1AdzyOKmadcTEnx_mLZcLb0jJCOedbLkG/view?usp=drive_link

## Overview

This app fulfills the requirements of the Shopify App Developer Challenge by enabling merchants to:

- **View Collections:** See a list of all existing collections with their names, priority levels, and associated products.
- **Create Collections:** Create new collections with unique names, optional priority levels, and select products from their store to add to the collection.
- **Edit Collections:** Update the name, priority level, and associated products of existing collections.

The app uses Remix.js for server-side rendering, Polaris for the user interface, Prisma for database management, and SQLite for data storage.

## Features

- Create, view, and edit collections.
- Assign priority levels (High, Medium, Low) to collections.
- Select and associate products with collections.
- Uses Shopify Polaris components for a consistent UI.
- Uses Prisma and SQLite for database management.
- Uses Remix.js for Server side rendering.

## Technologies Used

- Remix.js
- Shopify Polaris
- Prisma
- SQLite
- Shopify App Bridge

## Setup and Installation

1.  **Shopify Partner Account:**
    - Create a Shopify Partner account at [partners.shopify.com](https://partners.shopify.com).
    - Create a development store within your partner account.
2.  **Clone the Repository:**
    - Clone this GitHub repository to your local machine.
3.  **Install Dependencies:**
    - Navigate to the project directory and run `npm install` or `yarn install`.
4.  **Database Migrations:**
    - Run `npx prisma migrate dev --name init` to create the database schema.
    - Run `npx prisma generate` to generate the prisma client.
5.  **Shopify CLI:**
    - Install the shopify cli if you have not already.
    - Log in to your shopify partner account using the cli.
    - Create a new app using the cli.
6.  **.env File:**
    - Ensure your `.env` file is configured with the correct Shopify API keys and database connection string. The Shopify remix app template should do most of this for you.
7.  **Run the App:**
    - Run `npm run dev` or `yarn dev` to start the development server.
8.  **Install the App:**
    - Install the app in your development shop through the shopify partner dashboard.

## Database Schema

The app uses the following database schema:

- **Collection:**
  - `id` (Int, auto-increment)
  - `name` (String, unique)
  - `priority` (Enum: High, Medium, Low, optional)
  - `createdAt` (DateTime)
  - `products` (ProductCollection)
- **Product:**
  - `id` (String, primary key, Shopify product ID)
  - `title` (String)
  - `imageUrl` (String, optional)
  - `createdAt` (DateTime)
  - `collections` (ProductCollection)
- **ProductCollection:**
  - `collectionId` (Int, foreign key to Collection)
  - `productId` (String, foreign key to Product)
  - Composite primary key: `[collectionId, productId]`
