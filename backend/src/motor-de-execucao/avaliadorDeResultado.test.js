const test = require('node:test');
const assert = require('node:assert');
const { avaliar } = require('./avaliadorDeResultado');

test('quebra de linha do Windows não importa', () => {
    assert.strictEqual(avaliar('5\r\n', '5\n'), true);
});
test('a última quebra de linha não importa', () => {
    assert.strictEqual(avaliar('5\n', '5'), true);
});
test('sem quebra no fim também é aceito', () => {
    assert.strictEqual(avaliar('5', '5'), true);
});
test('linha em branco extra importa', () => {
    assert.strictEqual(avaliar('5\n\n', '5'), false);
});
test('espaço no fim da linha importa', () => {
    assert.strictEqual(avaliar('5 \n', '5'), false);
});
test('maiúscula importa', () => {
    assert.strictEqual(avaliar('Sim', 'sim'), false);
});