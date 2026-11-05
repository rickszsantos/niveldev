// ============================================================================
// SUBMISSIONS · SERVICE  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: o COORDENADOR do processo de submissão (regras de negócio).
// Ele não executa código: ele valida, prepara, chama o motor e salva.
//
// Fluxo previsto em enviar(ator, { exercicioId, linguagem, codigo }):
//   1. Validar entrada:
//        - exercício existe e está ativo (módulo exercises);
//        - linguagem está na lista permitida (v1: só 'python');
//        - código é texto, não vazio, com tamanho máximo (definir, ex.: 20 KB).
//   2. Buscar os casos de teste do exercício (entrada + saída esperada).
//        As saídas esperadas ficam SÓ no backend; nunca vão para o container.
//   3. Criar o registro da submissão no banco com status "em andamento"
//        (isso já gera o id único da submissão).
//   4. Chamar o motor:  executor.executar({ linguagem, codigo, casosDeTeste })
//   5. Receber o resultado padronizado (ver executionResult.js) e atualizar a
//        submissão (status, tempo, mensagem, qual teste falhou).
//   6. registrarLog(ator.id, 'submissao_enviada', { submissaoId, exercicioId, status }).
//   7. Devolver ao controller o que o aluno PODE ver (cuidado com testes ocultos:
//        nunca devolver a saída esperada de um caso marcado como oculto).
//
// Também previstos: obter(ator, id) e listarDoUsuario(ator, filtros), checando que
// só o dono (ou admin) enxerga o código e o resultado.
//
// Pontos a decidir:
//   - Impedir duas submissões simultâneas do mesmo usuário? (evita abuso)
//   - Se o motor der INTERNAL_ERROR, guardamos a submissão mesmo assim? (sugestão: sim)
// ============================================================================
