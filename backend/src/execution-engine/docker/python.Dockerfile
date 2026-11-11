FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN useradd --create-home --uid 1000 aluno

COPY scripts/python/run.sh /run.sh
RUN sed -i 's/\r$//' /run.sh && chmod +x /run.sh

WORKDIR /codigo
USER aluno
ENTRYPOINT ["/run.sh"]