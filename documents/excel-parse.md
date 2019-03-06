# Parsing an Excel file

### Format
```javascript
{
    definedNames: {
        name1: [
            {
                sheetName: "Sheet2",
                address: "A1",
                row: 1,
                col: 1
            },
            ...
            {...}
        ],
        name2: [{…}, {…}, {…}, ...],
        ...
    }
    sheets: {
        0: {
            col: {hidden: Array(0), width: Array(11), style: Array(11)}
            data: (42) [Array(11), Array(6), Array(6), Array(6), Array(11), Array(5), Array(5), Array(0), Array(3), Array(3), Array(3), Array(3), Array(3), Array(3), Array(4), Array(4), Array(3), Array(3), Array(6), Array(6), Array(3), Array(3), Array(3), Array(0), Array(2), Array(5), Array(5), Array(0), Array(8), Array(8), Array(10), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7)]
            merges: {B4: {…}, B6: {…}, B29: {…}, A2: {…}, B7: {…}, …}
            name: "Sheet1"
            row: {hidden: Array(0), height: Array(42), style: Array(42)}
            state: "show"
            style: (42) [Array(1), Array(6), Array(6), Array(6), Array(11), Array(5), Array(5), Array(0), Array(3), Array(3), Array(3), Array(3), Array(3), Array(3), Array(4), Array(4), Array(3), Array(3), Array(6), Array(6), Array(3), Array(3), Array(3), Array(0), Array(2), Array(5), Array(5), Array(0), Array(8), Array(8), Array(10), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7), Array(7)]
        },
        1: {…},
        2: {…},
        ...
    }
}
```
