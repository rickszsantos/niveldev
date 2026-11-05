// ============================================================================
// SUBMISSIONS · ROTAS  (ESTRUTURA — ainda não implementado)
// ============================================================================
// O que é: define as URLs do módulo de submissões e quem pode acessá-las.
// Mesmo padrão do authRoute.js / userRoute.js: monta o router, aplica os
// middlewares (minddware, autorizar, rate limit) e liga cada URL a uma função
// do controller. NÃO tem regra de negócio.
//
// Rotas previstas (a confirmar juntos):
//   POST /submissions           -> envia código para correção (aluno logado)
//                                  corpo: { exercicioId, linguagem, codigo }
//   GET  /submissions/:id       -> consulta o resultado de uma submissão
//                                  (dono da submissão ou administrador)
//   GET  /submissions?exercicioId=  -> histórico do próprio usuário
//
// Pontos a decidir:
//   - Rate limit por usuário (executar código é caro): quantas submissões por minuto?
//   - A resposta do POST é síncrona (espera o resultado) ou devolve o id e o front
//     consulta depois (assíncrona)? Para a v1 (poucos testes) a síncrona é mais simples.
//   - Ligar em app.js: app.use('/submissions', submissionRoute);
// ============================================================================
