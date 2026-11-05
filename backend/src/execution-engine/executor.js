// ============================================================================
// MOTOR · EXECUTOR  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: o MAESTRO do motor. Recebe o código + os casos de teste e conduz a
// correção do começo ao fim. É o único arquivo que o submissionService conhece.
//
// Assinatura prevista:
//   executar({ linguagem, codigo, casosDeTeste }) -> Promise<ExecutionResult>
//
// Fluxo previsto (seção 3 do documento do motor):
//   1. Gerar id único da execução (ex.: exec_<aleatório>).
//   2. Criar a pasta temp/executions/<id>/ e gravar o código como main.py
//      (extensão conforme a linguagem).
//   3. Pedir ao containerManager para criar o container isolado.
//   4. Para cada caso de teste, EM ORDEM:
//        a. enviar a entrada ao programa (via containerManager);
//        b. receber { saida, erro, codigoSaida, tempoMs, estourouTempo, estourouMemoria };
//        c. se houve falha de execução (timeout, memória, erro) -> monta o
//           resultado e PARA (não roda os testes restantes);
//        d. senão, pedir ao resultEvaluator para comparar saída x esperada;
//        e. se divergiu -> WRONG_ANSWER e PARA; se igual -> próximo teste.
//   5. Se todos passaram -> ACCEPTED.
//   6. SEMPRE (mesmo com erro): remover o container e a pasta temporária
//      (bloco finally). Nunca deixar lixo para trás.
//   7. Qualquer falha inesperada nossa vira INTERNAL_ERROR (nunca vaza detalhes
//      internos ao aluno).
//
// Regra de ouro: "O Docker executa o código; o backend controla e avalia".
// Este arquivo NÃO conhece detalhes do Docker (isso é do containerManager) e
// NÃO sabe comparar saídas (isso é do resultEvaluator).
//
// Pontos a decidir:
//   - Um container por submissão (docs) rodando todos os testes, ou um por teste?
//   - Quantas execuções simultâneas permitir (fila / limite global)?
// ============================================================================
