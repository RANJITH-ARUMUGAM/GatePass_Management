# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



# Work Flow of the Project

    1.Login Page
        In this page, we had  connect with backend to allow the admin,user to enter into the Home page with authentication. In this login page we added signup page connected to the same table of the backend and Forget password ,we designed the frontend and validate the page for getting mail id , then send otp and reset the password.

    2.Home page
        In home page, we contains cards for navigating to the Admin,Lobby and Gate pages of the Application with Top and Side Navigation Bar.
        In the top navbar, we can change the user password,and modify the details of the user.

    3.Admin Page
        Here we have userlist of all the existing user and admin.The admin can add a new user by using the Add User page and also modify the details of the exisisting user with backend connectivity.

    4.Gate & Lobby Page
        In both page,we commonly having the form for generating the visitor pass by capturing the visitor image and stored in the local folder. The form data is connected to the different table for gate and lobby in the database.
        And also I had designed a page for appointment booking in the Lobby and visitor details in the gate.

# Note : 
    There is some issue in the generating visitor Id(at line 104 :generateVisitorId()) in the visitor pass of Lobby and Gate Page.
    
    Displaying the Metadata details in the table format 

    Backend Port Number for my System is 5433 , configure it according to your Postgres Port.


### Additionally installed npm Packages

### `npm install axios`
 Used to make HTTP requests (GET, POST, PUT, DELETE) from your React frontend to backend APIs.

### `npm install react-bootstrap bootstrap`
Provides Bootstrap components as ready-to-use React components for responsive layouts, forms, cards, buttons, etc.

### `npm install react-calendar`
Styles the react-calendar component. Without this import, the calendar won't be styled properly.

### `npm install react-client-session`
Used to manage session data (like login state) on the client side — persists across page reloads.

### `npm install react-router-dom`
Enables SPA routing — manage page views with URL paths using components like Routes, Route, Navigate, and hooks like useNavigate.

### `npm install react-icons`
Provides a unified way to use icons from many popular icon libraries (Font Awesome, Feather, Lucide, etc.) as React components.


