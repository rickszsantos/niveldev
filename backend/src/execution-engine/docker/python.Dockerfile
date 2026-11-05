# ============================================================================
# MOTOR · python.Dockerfile  (ESTRUTURA — ainda não implementado; ainda sem FROM)
# ============================================================================
# O que é: a receita da IMAGEM usada para rodar código Python dos alunos.
# É construída uma vez (docker build) e cada submissão cria um container dela.
#
# O que conterá (a definir juntos):
#   - imagem base enxuta com Python (ex.: versão fixa "-slim" ou alpine; fixar versão);
#   - criação de um usuário SEM privilégios e USER apontando para ele;
#   - cópia do scripts/python/run.sh como ENTRYPOINT;
#   - pasta /codigo onde o main.py do aluno será disponibilizado (somente leitura);
#   - NENHUMA biblioteca extra na v1 (só a biblioteca padrão do Python).
#
# NÃO conterá: respostas esperadas, casos de teste, segredos do projeto (.env).
#
# Pontos a decidir:
#   - Quem constrói a imagem e quando (script de build manual? no boot do app?).
#   - Se algum exercício precisará de bibliotecas (ex.: math é padrão; numpy não).
# ============================================================================
