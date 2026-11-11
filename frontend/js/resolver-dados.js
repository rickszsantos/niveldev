/* ============================================================
   NívelDev — dados dos exercícios da tela de execução
   (usado por js/resolver.js)

   ATENÇÃO: ainda não existe API de exercícios no back-end, então
   estes exercícios são EXEMPLOS. São os mesmos 18 de js/categoria.js
   (mesmos ids, títulos e dificuldades). Quando a rota existir, troque
   este arquivo pelo retorno da API, mantendo os campos:

     id, titulo, categoria, dificuldade (1 a 10)
     enunciado: lista de parágrafos
     dica:      texto curto
     inicial:   código que já vem no editor
     testes:    [{ entrada, saida }]  (o 1º teste é mostrado como exemplo)

   Entrada = o que o programa recebe em cada input(), uma linha cada.
   ============================================================ */

(function () {
  const t = (entrada, saida) => ({ entrada, saida });

  // tabuada do n: "3 x 1 = 3" ... "3 x 10 = 30"
  const tabuada = (n) => Array.from({ length: 10 }, (_, i) => `${n} x ${i + 1} = ${n * (i + 1)}`).join('\n');

  window.NivelDevExercicios = [
    {
      id: 1, titulo: 'Soma de Dois Números', categoria: 'iniciante', dificuldade: 1,
      enunciado: ['Desenvolva um programa que leia dois números inteiros e exiba a soma entre eles.'],
      dica: 'Utilize input() para receber os valores e int() para transformá-los em números.',
      inicial: '# Leia os dois números e mostre a soma\n',
      testes: [t('5\n3', '8'), t('10\n-4', '6'), t('0\n0', '0')],
    },
    {
      id: 2, titulo: 'Par ou Ímpar', categoria: 'iniciante', dificuldade: 1,
      enunciado: ['Leia um número inteiro e informe se ele é par ou ímpar.', 'Exiba exatamente Par ou Ímpar.'],
      dica: 'Um número é par quando o resto da divisão por 2 é zero. O operador de resto é %.',
      inicial: '# Leia um número e diga se é Par ou Ímpar\n',
      testes: [t('4', 'Par'), t('7', 'Ímpar'), t('0', 'Par')],
    },
    {
      id: 3, titulo: 'Maior de Três Números', categoria: 'iniciante', dificuldade: 2,
      enunciado: ['Leia três números inteiros (um por linha) e exiba o maior deles.'],
      dica: 'Compare dois números por vez com if e elif, guardando o maior em uma variável.',
      inicial: '# Leia três números e mostre o maior\n',
      testes: [t('3\n9\n5', '9'), t('10\n2\n7', '10'), t('4\n4\n1', '4')],
    },
    {
      id: 4, titulo: 'Média de Notas', categoria: 'iniciante', dificuldade: 2,
      enunciado: [
        'Leia quatro notas (uma por linha) e calcule a média.',
        'Na primeira linha exiba Média: seguido do valor com uma casa decimal. Na segunda, exiba Aprovado se a média for 7 ou mais, senão Reprovado.',
      ],
      dica: 'Use float(input()) para notas com vírgula e f"{media:.1f}" para fixar uma casa decimal.',
      inicial: '# Leia quatro notas, calcule a média e diga se foi aprovado\n',
      testes: [t('8\n7\n9\n8', 'Média: 8.0\nAprovado'), t('5\n6\n4\n5', 'Média: 5.0\nReprovado'), t('7\n7\n7\n7', 'Média: 7.0\nAprovado')],
    },
    {
      id: 5, titulo: 'Tabuada', categoria: 'iniciante', dificuldade: 2,
      enunciado: ['Leia um número inteiro e mostre a tabuada dele de 1 a 10.', 'Use o formato 3 x 1 = 3, uma operação por linha.'],
      dica: 'Um laço for com range(1, 11) repete a conta dez vezes.',
      inicial: '# Leia um número e mostre a tabuada de 1 a 10\n',
      testes: [t('3', tabuada(3)), t('7', tabuada(7)), t('10', tabuada(10))],
    },
    {
      id: 6, titulo: 'Conversor de Temperatura', categoria: 'python', dificuldade: 2,
      enunciado: ['Leia uma temperatura em graus Celsius e exiba o valor em Fahrenheit com uma casa decimal.', 'Fórmula: F = C × 9 / 5 + 32.'],
      dica: 'Converta a entrada com float() e formate o resultado com f"{valor:.1f}".',
      inicial: '# Leia graus Celsius e mostre em Fahrenheit\n',
      testes: [t('0', '32.0'), t('100', '212.0'), t('37', '98.6'), t('-40', '-40.0')],
    },
    {
      id: 7, titulo: 'Calculadora Simples', categoria: 'python', dificuldade: 3,
      enunciado: [
        'Leia dois números inteiros (um por linha) e exiba, cada um em uma linha: a soma, a subtração, a multiplicação e a divisão.',
        'A divisão deve ter duas casas decimais. Os testes nunca usam divisor zero.',
      ],
      dica: 'A divisão com / devolve um número decimal. Use f"{a / b:.2f}" para formatá-lo.',
      inicial: '# Leia dois números e mostre soma, subtração, multiplicação e divisão\n',
      testes: [t('8\n2', '10\n6\n16\n4.00'), t('7\n2', '9\n5\n14\n3.50'), t('-9\n3', '-6\n-12\n-27\n-3.00')],
    },
    {
      id: 8, titulo: 'Contagem de Vogais', categoria: 'strings', dificuldade: 3,
      enunciado: ['Leia uma frase e conte quantas vogais (a, e, i, o, u) ela tem. Maiúsculas contam também.', 'A frase não tem acentos.'],
      dica: 'Percorra a frase com for e use .lower() para tratar maiúsculas e minúsculas do mesmo jeito.',
      inicial: '# Leia uma frase e conte as vogais\n',
      testes: [t('banana', '3'), t('Aprender Python', '4'), t('sky', '0')],
    },
    {
      id: 9, titulo: 'Inverter uma Palavra', categoria: 'strings', dificuldade: 3,
      enunciado: ['Leia uma palavra e exiba ela escrita de trás para frente.'],
      dica: 'Fatiar com [::-1] devolve o texto invertido.',
      inicial: '# Leia uma palavra e mostre ao contrário\n',
      testes: [t('python', 'nohtyp'), t('NivelDev', 'veDleviN'), t('a', 'a')],
    },
    {
      id: 10, titulo: 'Contar Palavras', categoria: 'strings', dificuldade: 3,
      enunciado: ['Leia um texto em uma linha e exiba quantas palavras ele tem.', 'Espaços repetidos ou nas pontas não contam como palavras.'],
      dica: 'O método .split() separa o texto por espaços e ignora os repetidos. Depois é só usar len().',
      inicial: '# Leia um texto e conte as palavras\n',
      testes: [t('Eu gosto de programar', '4'), t('  ola   mundo ', '2'), t('Python', '1')],
    },
    {
      id: 11, titulo: 'Maior Elemento da Lista', categoria: 'estruturas', dificuldade: 3,
      enunciado: ['Leia uma linha com números inteiros separados por espaço e exiba o maior deles.', 'Não use a função max().'],
      dica: 'Comece com o primeiro número como "maior" e compare cada um dos outros com ele.',
      inicial: '# Leia os números (separados por espaço) e mostre o maior, sem usar max()\n',
      testes: [t('3 8 1 9 4', '9'), t('-5 -2 -9', '-2'), t('7', '7')],
    },
    {
      id: 12, titulo: 'Fatorial', categoria: 'logica', dificuldade: 4,
      enunciado: ['Leia um número inteiro maior ou igual a zero e exiba o fatorial dele.', 'Lembre que 0! = 1.'],
      dica: 'Comece com resultado = 1 e multiplique por cada número de 2 até n.',
      inicial: '# Leia n e mostre o fatorial de n\n',
      testes: [t('5', '120'), t('0', '1'), t('10', '3628800')],
    },
    {
      id: 13, titulo: 'Palíndromo', categoria: 'strings', dificuldade: 4,
      enunciado: ['Leia uma palavra e verifique se ela é igual de trás para frente, ignorando maiúsculas.', 'Exiba Sim ou Não.'],
      dica: 'Compare a palavra em minúsculas com ela mesma invertida ([::-1]).',
      inicial: '# Leia uma palavra e diga se é palíndromo (Sim ou Não)\n',
      testes: [t('arara', 'Sim'), t('python', 'Não'), t('Ovo', 'Sim')],
    },
    {
      id: 14, titulo: 'Remover Duplicados', categoria: 'estruturas', dificuldade: 5,
      enunciado: ['Leia uma linha com números separados por espaço e exiba os números sem repetições, na ordem em que apareceram pela primeira vez.', 'Exiba tudo em uma linha, separado por espaço.'],
      dica: 'Guarde em uma lista só os números que ainda não estão nela e depois use " ".join().',
      inicial: '# Leia os números e mostre sem repetições, mantendo a ordem\n',
      testes: [t('1 2 2 3 1 4', '1 2 3 4'), t('5 5 5', '5'), t('9 8 7', '9 8 7')],
    },
    {
      id: 15, titulo: 'Ordenar Lista', categoria: 'estruturas', dificuldade: 6,
      enunciado: ['Leia uma linha com números inteiros separados por espaço e exiba-os em ordem crescente, em uma linha.', 'Não use sort() nem sorted().'],
      dica: 'Pense no bubble sort: compare vizinhos e troque de lugar quando estiverem fora de ordem.',
      inicial: '# Leia os números e mostre em ordem crescente, sem usar sort()\n',
      testes: [t('5 3 8 1', '1 3 5 8'), t('10 -1 4', '-1 4 10'), t('2 2 1', '1 2 2')],
    },
    {
      id: 16, titulo: 'Verificar Número Primo', categoria: 'logica', dificuldade: 7,
      enunciado: ['Leia um número inteiro e informe se ele é primo.', 'Exiba Primo ou Não primo. Lembre que 1 não é primo.'],
      dica: 'Basta testar divisores de 2 até a raiz quadrada do número. Se algum dividir sem resto, não é primo.',
      inicial: '# Leia um número e diga se é Primo ou Não primo\n',
      testes: [t('7', 'Primo'), t('10', 'Não primo'), t('1', 'Não primo'), t('97', 'Primo')],
    },
    {
      id: 17, titulo: 'Primos até N', categoria: 'logica', dificuldade: 8,
      enunciado: ['Leia um número N (maior ou igual a 2) e exiba todos os primos de 2 até N, em uma linha, separados por espaço.'],
      dica: 'Reaproveite a ideia do teste de primo dentro de um laço que percorre de 2 até N.',
      inicial: '# Leia N e mostre os números primos de 2 até N\n',
      testes: [t('10', '2 3 5 7'), t('20', '2 3 5 7 11 13 17 19'), t('2', '2')],
    },
    {
      id: 18, titulo: 'Sequência de Fibonacci', categoria: 'logica', dificuldade: 9,
      enunciado: ['Leia N (maior ou igual a 1) e exiba os N primeiros números da sequência de Fibonacci, em uma linha, separados por espaço.', 'A sequência começa em 0 e 1, e cada número seguinte é a soma dos dois anteriores.'],
      dica: 'Guarde os dois últimos números em variáveis e atualize ambos a cada volta do laço: a, b = b, a + b.',
      inicial: '# Leia N e mostre os N primeiros números de Fibonacci\n',
      testes: [t('7', '0 1 1 2 3 5 8'), t('1', '0'), t('10', '0 1 1 2 3 5 8 13 21 34')],
    },
  ];

  // categorias (os mesmos ids da tela de Exercícios)
  window.NivelDevCategorias = {
    iniciante: 'Iniciante',
    python: 'Python',
    strings: 'Strings',
    estruturas: 'Estruturas de Dados',
    logica: 'Lógica',
    outros: 'Outros',
  };
})();
