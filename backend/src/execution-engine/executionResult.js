// ============================================================================
// MOTOR · EXECUTION RESULT  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: o "formato único" do que o motor devolve, para o resto do sistema
// nunca receber respostas em formatos diferentes. Centraliza os status e uma
// função para montar o resultado.
//
// Status (seção 8 do documento):
//   ACCEPTED               todos os testes passaram
//   WRONG_ANSWER           saída diferente da esperada
//   TIME_LIMIT_EXCEEDED    passou do tempo permitido
//   RUNTIME_ERROR          erro durante a execução (exceção, código de saída != 0)
//   MEMORY_LIMIT_EXCEEDED  passou do limite de memória
//   INTERNAL_ERROR         falha NOSSA (Docker fora do ar, disco cheio...)
//
// Formato previsto do resultado:
//   { status, tempoMs, testesPassados, totalTestes, testeFalhouIndice,
//     mensagem (texto seguro para o aluno), detalhe (opcional, p/ log interno) }
//
// Funções previstas: constantes STATUS + criar(status, dados) que garante o formato.
//
// Ponto a decidir: o que o aluno pode ver quando falha (stderr do Python ajuda
// muito a aprender, mas pode expor caminhos internos — filtrar).
// ============================================================================
