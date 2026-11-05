#!/bin/sh
# ============================================================================
# MOTOR · run.sh (Python)  (ESTRUTURA — ainda não implementado)
# ============================================================================
# O que é: o script que roda DENTRO do container para iniciar o programa do aluno.
# É o ponto de entrada (ENTRYPOINT) da imagem definida em docker/python.Dockerfile.
#
# O que fará (a definir juntos):
#   - executar o arquivo do aluno: python3 /codigo/main.py
#   - ler a entrada do teste pela entrada padrão (stdin), sem argumentos do usuário;
#   - deixar stdout e stderr separados para o backend coletar;
#   - propagar o código de saída do Python (0 = ok, != 0 = RUNTIME_ERROR).
#
# NÃO deve: ter respostas esperadas, acessar rede, ou rodar como root.
#
# Ponto a decidir: o limite de tempo é aplicado aqui (comando `timeout`) ou só
# pelo backend (containerManager)? Sugestão: o backend é quem manda; aqui no máximo
# um limite de segurança.
# ============================================================================
