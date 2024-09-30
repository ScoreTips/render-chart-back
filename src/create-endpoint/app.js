const AWS = require('aws-sdk');
const Snowflake = require('./snowflake'); // Snowflake ID generator
const dynamo = new AWS.DynamoDB.DocumentClient();

const snowflake = new Snowflake(1); // Worker ID

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const snowflakeId = snowflake.generate();

    // Salva o Snowflake ID e os dados no DynamoDB
    await dynamo.put({
        TableName: process.env.TABLE_NAME,
        Item: {
            id: snowflakeId,
            data: data,
        },
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({ slug: snowflakeId }),
    };
};
