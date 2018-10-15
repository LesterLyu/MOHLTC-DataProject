# Excel Display
### Libraries
 - Table: [HandsonTable CE](https://handsontable.com/)
 - Tabs: Bootstrap native [nav-tab](https://getbootstrap.com/docs/4.1/components/navs/#tabs)
 - [Formula Parser](https://github.com/Subtletree/formula-parser) (buggy, needs highly customization)

## Colors
Colors in font, border, tabs, etc...
#### Supported
 - [X] [Excel Indexed Colors](https://github.com/ClosedXML/ClosedXML/wiki/Excel-Indexed-Colors)
    - Current implementation: parse indexed color to normal argb colors in back-end.
 - [X] ARGB Colors (Custom color in Excel)
    - Able to display directly on webpages
#### Not supported
 - [ ] [Theme Colors](https://www.google.ca/search?{google:acceptedSuggestion}oq=excel+theme+colors&sourceid=chrome&ie=UTF-8&q=excel+theme+colors)
    - Theme colors are stored in each excel file in XML format

## Fonts and Styles
#### Supported
 - [X] **Bold**
 - [X] *Italic* 
 - [X] Font color
 - [X] Background color
 
#### Not supported
 - [ ] Fonts
 - [ ] Font size
 - [ ] All other font styles...

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
A buggy library.
#### Native Library Support
  * Any numbers, negative and positive as float or integer;
  * Arithmetic operations like `+`, `-`, `/`, `*`, `%`, `^`;
  * Logical operations like `AND()`, `OR()`, `NOT()`, `XOR()`;
  * Comparison operations like `=`, `>`, `>=`, `<`, `<=`, `<>`;
  * All JavaScript Math constants like `PI()`, `E()`, `LN10()`, `LN2()`, `LOG10E()`, `LOG2E()`, `SQRT1_2()`, `SQRT2()`;
  * String operations like `&` (concatenation eq. `parser.parse('-(2&5)');` will return `-25`);
  * All excel formulas defined in [These formulas](https://github.com/Subtletree/formula-parser/blob/develop/src/supported-formulas.js) 
  * Relative and absolute cell coordinates like `A1`, `$A1`, `A$1`, `$A$1`;
  * Build-in variables like `TRUE`, `FALSE`, `NULL`
  * Custom variables;
  
#### Supported
  - [X] Cell, sheet reference
  
#### Not supported
  - [ ] re-evaluate upon other value changes
  
## Richtext
####Not yet Supported.

