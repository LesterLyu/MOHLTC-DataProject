# Current User

Query the current user logged in.

**URL** : `/api/users/current/`

**Method** : `GET`

**Permission required** : `No`

**Data constraints:** : `None`

## Success Response

**Code** : `200 OK`

**Content example - when a user logged in**

```javascript
{
  "success": true,
  "user": 
    {
      username: "lester", // string
      firstName: "first name here...", // string
      lastName: "last name here...", // string
      createDate: 4353457345, // number (timestamp)
      phoneNumber: "+1 666 666 6666", // string
      organization: "organization name here...", // string
      validated: true, // boolean
      email: "random@random.com", // string
      groupNumber: 1, // number
      active: true, // boolean
      permissions: [ // array of strings
         "admin-add-workbook"
      ] 
    }
}
```

**Content example - when not logged in**

```javascript
{
    "success": true,
    "user": null // null
}
```

## Error Response

**Condition** : Server error.

**Code** : `500 INTERNAL ERROR`

**Content** :

```json
{
    "success":false,
    "msg": "error message"
}
```
