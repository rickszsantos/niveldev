// ============================================================================
// SUBMISSIONS · CONTROLLER  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: a "porta de entrada" HTTP. Lê req.body / req.params / req.user,
// chama o service e devolve a resposta (res.status(...).json(...)).
// NÃO valida regra de negócio nem fala com banco ou Docker.
//
// Funções previstas:
//   enviar(req, res)   -> lê { exercicioId, linguagem, codigo } do corpo e o id do
//                         usuário em req.user.id; chama submissionService.enviar;
//                         responde 201 com o resultado padronizado.
//   obter(req, res)    -> chama submissionService.obter(req.user, id).
//   listar(req, res)   -> chama submissionService.listarDoUsuario(...).
//
// Lembrete: no Express 5 erros em funções async já vão para o errorHandler.
// ============================================================================
