// ============================================================================
// SUBMISSIONS · REPOSITORY  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: o ÚNICO lugar com SQL de submissões (mesmo padrão do userRepository).
//
// Funções previstas:
//   criar({ usuarioId, exercicioId, linguagem, codigo })  -> INSERT, devolve o id
//   finalizar(id, { status, tempoMs, mensagem, testeFalhouIndice }) -> UPDATE
//   findById(id)                       -> uma submissão
//   listarPorUsuario(usuarioId, { exercicioId, limite, offset })
//
// Tabela prevista "submissions" (a criar no schema.sql, na Fase 2/3):
//   id BIGSERIAL PK, usuario_id -> users, exercicio_id -> exercises,
//   linguagem, codigo TEXT, status (ACCEPTED, WRONG_ANSWER, ...),
//   tempo_ms, mensagem, teste_falhou_indice, criado_em.
// Tabelas relacionadas (módulo exercises): "exercises" e "test_cases"
//   (entrada, saida_esperada, oculto).
//
// Pontos a decidir:
//   - Guardar a saída obtida de cada teste? (ajuda a mostrar "esperado x obtido",
//     mas pode vazar testes ocultos — decidir regra).
// ============================================================================
