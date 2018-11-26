# Workbook Query

Query user entered workbook data **for your group**.

**URL** : `/api/workbook/query/`

**Method** : `GET`

**Permission required** : ```config.permissions.WORKBOOK_QUERY```

**Data constraints:**

| Name        |Type           | Default  | Description |
| ----------- |:-------------:| :--------: | :---------- |
| wbName | `String`       |     | Name of the workbook you want to query |
| onlyFilled | ` Object`   |   `false`  | exclude the user who does not fill the workbook  |
| queryData (*see below) | ` Object`   |     | Query data |

**queryData constraints:**

```javascript
queryData:
  {
    worksheetName1: // worksheet name
      [
        [1212, 1234],  // [catId, attId]
        [1232, 1235],
        [5432, 1335],
      ],
    worksheetName2: // worksheet name
      [
        [2323, 1232],  // [catId, attId]
        [1267, 1345],
      ]
  }
```
			

## Success Response

**Code** : `200 OK`

**Content example**

```javascript
{
    "success": true,
    "result": 
      {
         "worksheetName1": // worksheet name
          [
            [ // corresponding [catId, attId]
               {"username": "username1", "catId": "1232", "attId": "3242", "data": "some data"},
               {"username": "username2", "catId": "4545", "attId": "1", "data": "some data"},
            ],
            [
               {"username": "username1", "catId": "5342", "attId": "2", "data": "some data"},
               {"username": "username2", "catId": "7543", "attId": "3", "data": "some data"},
               {"username": "username2", "catId": "4534", "attId": "2412", "data": "some data"},
            ],
            [ 
               {"username": "username1", "catId": "2344", "attId": "6745", "data": "some data"},
               {"username": "username2", "catId": "6454", "attId": "4562", "data": "some data"},
            ],
          ],
        "worksheetName2": // worksheet name
          [
            [ // corresponding [catId, attId]
               {"username": "username1", "catId": "3422", "attId": "1231", "data": "some data"},
               {"username": "username2", "catId": "3421", "attId": "1231", "data": "some data"},
            ],
            [
               {"username": "username1", "catId": "1243", "attId": "1231", "data": "some data"},
               {"username": "username2", "catId": "3421", "attId": "1231", "data": "some data"},
            ]
         ],
      }
}
```

## Error Response

**Condition** : N/A.

**Code** : `500 INTERNAL ERROR`

**Content** :

```json
{
    "success":false,
    "msg": "error message"
}
```
