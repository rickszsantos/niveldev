// ============================================================================
// MOTOR · RESULT EVALUATOR  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: decide se a saída do programa está CERTA. Compara "saída obtida"
// com "saída esperada". Não executa nada, não usa Docker: é lógica pura
// (fácil de testar).
//
// Função prevista:
//   avaliar(saidaObtida, saidaEsperada) -> boolean   (ou { correto, motivo })
//
// Regras de comparação a definir juntos (o ponto mais delicado deste arquivo):
//   - Ignorar espaços/linhas em branco no FINAL? (quase sempre sim)
//   - Normalizar quebras de linha \r\n x \n? (sim)
//   - Espaços no meio da linha contam? (decidir: estrito x tolerante)
//   - Diferenciar maiúsculas de minúsculas? (sim, por padrão)
//   - Números decimais com tolerância (ex.: 0.1+0.2)? (provavelmente fora da v1)
// ============================================================================
