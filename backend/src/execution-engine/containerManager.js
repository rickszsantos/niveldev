// ============================================================================
// MOTOR · CONTAINER MANAGER  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: tudo que toca no Docker. Cria, inicia, conversa com e remove o
// container onde o código do aluno roda. Só ele sabe "como" falar com o Docker.
//
// Funções previstas:
//   criar({ linguagem, pastaExecucao }) -> containerId
//       docker create com as restrições de segurança (seção 7 do documento).
//   executarTeste(containerId, entrada, { limiteTempoMs }) -> { saida, erro,
//       codigoSaida, tempoMs, estourouTempo, estourouMemoria }
//       entrega a entrada ao programa (stdin) e coleta stdout/stderr.
//   remover(containerId)  -> docker rm -f (idempotente: não falha se já sumiu).
//
// Restrições obrigatórias do container (a configurar juntos):
//   - memória 128 MB (RNF15) e sem swap extra;
//   - limite de CPU;
//   - limite de processos (evita fork bomb);
//   - sem rede (network none);
//   - usuário sem privilégios (não root), sistema de arquivos somente leitura
//     exceto onde for indispensável;
//   - limite de tempo de execução (matar o container se passar);
//   - limite do tamanho da saída (cortar saídas gigantes).
//
// Pontos a decidir (importantes):
//   - Como o Node fala com o Docker: biblioteca (dockerode) ou comando `docker` via
//     child_process? E em produção, o app (que roda em container) precisa de acesso
//     ao Docker do servidor — isso muda o docker-compose.yml e tem implicação de
//     segurança séria (montar o socket do Docker dá poder de root no servidor).
//   - Como detectar estouro de memória (código de saída 137 / flag OOMKilled).
// ============================================================================
