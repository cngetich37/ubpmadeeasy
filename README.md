# UBPMadeEasy

## Search UBP

This repository contains the source code for a web application that provides information about various business activities. Users can search for specific business activities, view details about industries, business categories, subcategories, and access financeact-related information for selected activities.

## Features

- **Search Functionality**: Users can search for specific business activities using a search input field.
- **Dynamic Data Loading**: The application dynamically loads data from an external API based on user input and selected options.
- **Detailed Information**: Users can view detailed information about industries, business categories, and subcategories related to the selected business activity.
- **Finance Act Display**: Finance-related data, including trade licence, fire clearance, food hygiene, health certificates, and pest control, are displayed in a tabular format.
- **PDF Sharing**: Users can generate and share PDF documents containing detailed information about the selected business activity and its finance-related data.

## Technologies Used

- **React**: The frontend of the application is built using React, a popular JavaScript library for building user interfaces.
- **React Router**: Used for client-side routing, enabling navigation between different components of the application.
- **react-select**: Provides a customizable Select component for searching and selecting business activities.
- **jspdf**: Utilized for generating PDF documents dynamically within the application.
- **CSS**: Custom CSS styles are used for styling components and enhancing the user interface.
- **Fetch API**: Used for making asynchronous HTTP requests to fetch data from the backend API.
- **Node.js**: The backend API is built using Node.js, providing data related to industries, business categories, subcategories, and finance-related information.

## Search Advert

The `SearchAdvert` is a React component responsible for displaying and managing outdoor advertisement search functionality. It allows users to search for different types of advertisements and calculates the associated fees based on user input.

### State Variables

- **searchInput**: Manages the user input for the advertisement search.
- **loading**: Indicates whether data is currently being fetched.
- **options**: Stores the available advertisement options fetched from an API.
- **advertisementCategory**: Holds the category of the selected advertisement.
- **length** and **width**: Manage the dimensions of the advertisement.
- **applicationFee**: Stores the application fee for the selected advertisement.
- **firstThreeMetres**, **firstSquareMetres**, **firstTenSquareMetres**, **extraSquareMetres**: Hold different fee values based on advertisement type and dimensions.
- **licenceFee** and **licenceFeeN**: Manage the licence fee for renewal and new applicants, respectively.
- **perEachperYear**: Stores the fee per year for certain advertisement types.

#### SideBar Component

The `SideBar` component is imported and used within the `SearchAdvert` component for  navigation.

#### React Router

The `useLocation` hook from `react-router-dom` is used to access the current location and query parameters.

#### Select Component

The `Select` component from `react-select` library is used to render a dropdown menu for selecting advertisement types. Custom styling is applied to enhance the UI.

#### useEffect Hooks

- **Fetch Options**: Fetches the available advertisement options from an API when the component mounts.
- **Fetch Data**: Fetches advertisement data based on user input. Uses debouncing to optimize API calls.
- **Calculate Licence Fee**: Calculates the licence fee based on the selected advertisement type and dimensions. Updates whenever there is a change in relevant state variables.

#### Rendering

The component renders a responsive layout with input fields for advertisement dimensions and displays various fee-related information based on user input. It also provides feedback on loading state during data fetching.

## Setup Instructions

1. Clone the repository to your local machine using the following command:

    ```bash
    git clone https://github.com/ubpmadeeasy/ubpmadeeasy.git
    ```

2. Navigate to the project directory:

    ```bash
    cd ubpmadeeasy
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Open your browser and visit `http://localhost:5173` to view the application.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, feel free to fork the repository, make your changes, and submit a pull request.

## Firebase

npm install -g firebase-tools
npm run build
firebase deploy
firebase hosting:channel:deploy ubppreview


## Acknowledgements

Special thanks to the developers and contributors of the libraries and tools used in this project.
