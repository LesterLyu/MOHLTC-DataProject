# Excel Display
### Libraries
 - Table: Handbuild with Material-UI & [react-window](https://github.com/LesterLyu/react-window)
 - Tabs: Material-UI Tabs
 - Formula Parser: [fast-formula-parser (handbuild)](https://github.com/LesterLyu/fast-formula-parser)
 - Excel Library: [xlsx-populate  (handbuild)](https://github.com/LesterLyu/xlsx-populate)
 - [Spreadsheet Formatting](https://github.com/LesterLyu/fast-formula-parser/blob/master/ssf/ssf.js)

## Colors
Colors in font, border, tabs, etc...
#### Supported
 - [X] [Excel Indexed Colors](https://github.com/ClosedXML/ClosedXML/wiki/Excel-Indexed-Colors)
    - Current implementation: parse indexed color to normal argb colors in back-end.
 - [X] ARGB Colors (Custom color in Excel)
    - Able to display directly on webpages
 - [X] [Theme Colors](https://www.google.ca/search?{google:acceptedSuggestion}oq=excel+theme+colors&sourceid=chrome&ie=UTF-8&q=excel+theme+colors)
    - Theme colors are stored in each excel file in XML format

## Fonts and Styles
#### Supported
 - [X] **Bold**
 - [X] *Italic* 
 - [X] Font color
 - [X] Background color
 - [X] Alignments
    - top, middle, bottom, left, center, right
 - [X] Fonts
 - [X] Font size
 - [X] Almost all other font styles...

## Borders
#### Supported
 - [X] Border Color

#### Not supported
 - [ ] Border line width
    - Currently width is locked in 1px
 - [ ] Border line Styles
    - Currently display all style in solid border
 - [ ] All other styles
 
## Formulas
A handbuild library.

#### Supported
  - [X] Cell, sheet reference
  - [X] re-evaluate upon other value changes
  
## Richtext
  - [X] fully supported (readonly)

## Data validation
  - [X] list data validation (readonly)

