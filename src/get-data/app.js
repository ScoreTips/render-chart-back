const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const EXPIRATION_TIME = parseInt(process.env.EXPIRATION_TIME); // 1 hora

exports.handler = async (event) => {
    const slug = event.pathParameters.slug;
    const currentTimestamp = Date.now();

    // Busca o item no DynamoDB
    const result = await dynamo.get({
        TableName: process.env.TABLE_NAME,
        Key: { id: slug },
    }).promise();

    // Verifica se o item existe
    if (!result.Item) {
        return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Item não encontrado' }),
        };
    }

    // Extrai o timestamp do Snowflake ID e calcula a expiração
    const snowflakeTimestamp = parseInt(slug.slice(0, 10), 16); // Os primeiros 41 bits do ID
    const creationTime = snowflakeTimestamp + 1288834974657; // Ajusta o timestamp para o Epoch

    if (currentTimestamp - creationTime > EXPIRATION_TIME * 1000) {
        // Se já expirou, apaga o item e retorna um erro
        await dynamo.delete({
            TableName: process.env.TABLE_NAME,
            Key: { id: slug },
        }).promise();

        return {
            statusCode: 410,
            body: JSON.stringify({ error: 'Item expirado e removido' }),
        };
    }

    // Se ainda não expirou, retorna os dados
    return {
        statusCode: 200,
        body: JSON.stringify(result.Item.data),
    };
};
