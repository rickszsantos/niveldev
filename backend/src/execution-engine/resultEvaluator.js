const normalizar = (texto) => {
    const semCR = texto.replace(/\r\n/g, '\n');
    return semCR.endsWith('\n') ? semCR.slice(0, -1) : semCR;
};

const avaliar = (saidaObtida, saidaEsperada) =>
    normalizar(saidaObtida) === normalizar(saidaEsperada);




module.exports = { avaliar };