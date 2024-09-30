const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const EXPIRATION_TIME = parseInt(process.env.EXPIRATION_TIME); // 1 hora

exports.handler = async () => {
    const currentTimestamp = Date.now();

    // Faz scan na tabela para pegar todos os itens
    const scanResult = await dynamo.scan({
        TableName: process.env.TABLE_NAME,
    }).promise();

    const expiredItems = scanResult.Items.filter(item => {
        const snowflakeTimestamp = parseInt(item.id.slice(0, 10), 16);
        const creationTime = snowflakeTimestamp + 1288834974657;
        return (currentTimestamp - creationTime) > EXPIRATION_TIME * 1000;
    });

    // Deleta os itens expirados
    const deletePromises = expiredItems.map(item =>
        dynamo.delete({
            TableName: process.env.TABLE_NAME,
            Key: { id: item.id },
        }).promise()
    );

    await Promise.all(deletePromises);

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `${expiredItems.length} itens removidos` }),
    };
};
