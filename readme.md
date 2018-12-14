# DataProject
## Live on http://ec2-3-16-106-158.us-east-2.compute.amazonaws.com
## TO-DO
  - [ ] Warning when delete workbook that is filled by user
 
  

## Finished
 - [X] "Change Password" in Profile page
 - [X] "Change Profile" in Profile page
 - [X] Warning when delete attribute/category that is used in the system
 - [X] Read excel styles in back-end
 - [X] API for upload excel and apply style to workbook
 - [X] Show workbooks with excel styles
 - [X] Setup page (First time run)
 - [X] Use [xlsx-populate](https://github.com/dtjohnson/xlsx-populate) to export excel. This library preserve the original style and less buggy.

## Documents
- [Update history](documents/update-history.md)
- [First time setup](documents/setup.md)
- [Excel Indexed Colors](https://github.com/ClosedXML/ClosedXML/wiki/Excel-Indexed-Colors)
- [Supported excel styles to display in front-end](documents/excel-display.md)
- [How it parses and stores excel in database](documents/excel-parse.md)


# Purpose
The purpose of this project/application is to create an easier way for users to submit forms to the government. When entering in a form, the user has two choices: the first choice is to fill in the form on the browser and the second choice is to convert the table into an excel sheet and fill it in later. Both the table in the browser and the excel sheet can be read and have their information sent to a database.

## Language
The logic of this application is mainly done in Javascript. Tools used:
- Server-side: *Node.js*, *Express*
  - User authentication: Passport
  - Database Driver: Mongoose
  - Templating engine: EJS
- Front-end Styling: *Bootstrap 4*
- Database: MongoDB

## Overview of tables
### User
- user: Contains user's information entered in the sign-up page. GroupNumber tells us what group of forms the user can fill out.
```javascript
let userSchema = new mongoose.Schema({
    username: {type: String, unique: true}, //act like a primary key
    firstName: String,
    lastName: String,
    createDate: {type: Date, default: Date.now},
    phoneNumber: String,
    validated: Boolean,  // once the user verified the account, validated->true
    type: {type: Number, required: true}, // system admin=0, form manager=1, user=2
    email: {type: String, unique: true}, // has to be unique
    groupNumber: Number,  // group number represents different organizations, each organization does not share any data with others
    active: {type: Boolean, default: true}, // user can be disabled
});
```
- attributes: Table that stores attributes in forms. datatableid tells us what form the attribute belongs to.
```javascript
let attributeSchema = new mongoose.Schema({
    attribute: {type: String},
    groupNumber: {type: Number, required: true} // group number represents different organizations, each organization does not share any data with others
});
```
- categories: Table that stores categories in forms. datatableid tells us what form the category belongs to.
```javascript
let categorySchema = new mongoose.Schema({
    category: {type: String},
    groupNumber: {type: Number, required: true} // group number represents different organizations, each organization does not share any data with others
});
```
- workbook: Represents a form with a title and a group number that tells us what group of users can fill the form
```javascript
let workbookSchema = new mongoose.Schema({
    name: {type: String, required: true},
    groupNumber: {type: Number, required: true}, // group number represents different organizations, each organization does not share any data with others
    /**
     * { sheet1: [[.., .., ..],  // row 1
     *            [.., .., ..],  // row 2
     *            ...
     *            [.., .., ..]]   // row n
     * ], sheet2: [[]]}
     */
    data: {}, // empty workbook can have data populated
});
```
- filledWorkbook
```javascript
let fillerWorkbookSchema = new mongoose.Schema({
    name: String,
    username: String,  // who filled this workbook
    date: {type: Date, default: Date.now}, // filled date
    groupNumber: {type: Number, required: true}, // group number represents different organizations, each organization does not share any data with others
     /** same structure as **Workbook**
     * { sheet1: [[.., .., ..],  // row 1
     *            [.., .., ..],  // row 2
     *            ...
     *            [.., .., ..]]   // row n
     * ], sheet2: [[]]}
     */
    data: {},
});
```

# Current stage of development
### Completed features:
- Signup with email verification
- Signin
- Create workbook with many sheets
- Export workbook to excel
- Import excel files to workbook

