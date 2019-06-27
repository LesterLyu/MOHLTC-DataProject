# Delete a category

**URL** : `/api/category/:categoryId`

**Method** : `DELETE`

**Permission required** : `ATTRIBUTE_CATEGORY_MANAGEMENT`

**Data constraints:** : `None`

## Success Response

**Condition** : The category requested does not exist or deletion succeeds.

**Code** : `200 OK`

**Content example**

```javascript
{
    "success": true
}
```

## Error Response

#### **Condition** : The category requested is being used.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "success": false,
    "msg": ":categoryId cannot be deleted, workbook1, workbook2 are using this category."
}
```


#### **Condition** : Server error.

**Code** : `500 INTERNAL ERROR`

**Content** :

```json
{
    "success": false,
    "msg": "error message"
}
```
