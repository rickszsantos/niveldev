FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 
ENV PYTHONUNBUFFERED=1

RUN useradd --create-home --uid 1000 aluno

COPY backend/src/motor-de-execucao/scripts/python/executar.sh /executar.sh
RUN sed -i 's/\r$//' /executar.sh && chmod +x /executar.sh

WORKDIR /codigo
USER aluno
ENTRYPOINT ["/executar.sh"]