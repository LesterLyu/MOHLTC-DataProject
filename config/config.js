module.exports = {
    database: "mongodb://127.0.0.1/dataproject",
    testDatabase: "mongodb://127.0.0.1/testdataproject",
    superSecret: "df;gjk3409tgpofdbvkw4gk-rwit24t,gdfpovoqeo[13- -3i -3 i-0ids-f-i-ak123-i 1--sH(*n( *y (*y(W#(*jhSD)*D)*SJ_(U#n_DXJ_ d",
    mailServer: { //smtp
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "w767089351@gmail.com",
            pass: "wkw1234567"
        },
        sender: '"Will Wang" <w767089351@gmail.com>'
    },
    OPTS: {
        server: {
            url: 'ldap://HSCGIQDCAPWSA06:389',
            bindDN: 'cn=root',
            bindCredentials: 'passw0rd',
            searchBase: 'DC=HEALTHINFO,DC=MOH.GOV.ON.CA',
            searchFilter: '(uid={{username}})'
        }
    },

    serverHostname: "http://localhost:3000", //used for receive validation link
    permissions: {
        //FILL_WORKBOOK: 'fill-workbook', // not implemented, fow now, everyone can fill workbooks
        WORKBOOK_TEMPLATE_MANAGEMENT: 'CRUD-workbook-template',
        ATTRIBUTE_CATEGORY_MANAGEMENT: 'create-delete-attribute-category',
        USER_MANAGEMENT: 'user-management',
        SYSTEM_MANAGEMENT: 'system-management',
        WORKBOOK_QUERY: 'workbook-query'
    },
    constants: {
        categoryIdStartFrom: 1000000,
        attributeIdStartFrom: 3000000,
    },
    disableEmailValidation: true,
    disableLdap: true,
    organizations: [],
    maxGroupNumber: 0,
};
