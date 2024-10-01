const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const EXPIRATION_TIME = parseInt(process.env.EXPIRATION_TIME);

exports.handler = async (event) => {
    const slug = event.pathParameters.slug;
    const currentTimestamp = Date.now();

    const result = await dynamo.get({
        TableName: process.env.TABLE_NAME,
        Key: { id: slug },
    }).promise();

    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Item não encontrado' }),
        };
    }

    const snowflakeTimestamp = BigInt(slug) >> 22n;
    const creationTime = Number(snowflakeTimestamp) + 1288834974657;

    if (currentTimestamp - creationTime > EXPIRATION_TIME * 1000) {
        await dynamo.delete({
            TableName: process.env.TABLE_NAME,
            Key: { id: slug },
        }).promise();

        return {
            statusCode: 410,
            body: JSON.stringify({ error: 'Item expirado e removido' }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result.Item.data),
    };
};
