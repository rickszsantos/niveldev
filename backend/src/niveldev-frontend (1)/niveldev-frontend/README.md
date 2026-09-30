# NívelDev — Tela inicial (front-end)

Ponto de partida da tela inicial do NívelDev, em HTML, CSS e JS puro,
pra abrir direto no VS Code.

## Estrutura

```
niveldev-frontend/
├── index.html        → estrutura da página (hero, recursos, trilhas, CTA, rodapé)
├── css/
│   └── style.css      → variáveis de cor, layout e responsivo
├── js/
│   └── script.js       → comportamento do botão de cadastro (só um placeholder por enquanto)
└── img/
    └── logo.jpeg      → logo do NívelDev
```

## Como rodar

1. Abra a pasta `niveldev-frontend` no VS Code.
2. Instale a extensão **Live Server** (se ainda não tiver).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.

Sem Live Server, também dá pra só abrir o `index.html` direto no navegador,
mas com Live Server a página recarrega sozinha a cada alteração salva.

## O que já está pronto

- Seção hero com o degradê azul da marca, logo e chamada para cadastro
- Seção "Recursos" com os 4 diferenciais da plataforma
- Seção "Trilhas" com os 4 eixos de conteúdo (Fundamentos, Web, Banco de
  Dados, Arquitetura)
- Bloco final de CTA + rodapé
- Layout responsivo (o grid quebra em telas menores)

## Próximos passos sugeridos

- Criar as páginas de **cadastro** e **login** e ligar os botões da home nelas
- Quando o back-end do Carlos tiver uma rota de cadastro, trocar o
  `alert()` em `js/script.js` por um `fetch()` de verdade
- Extrair o cabeçalho/rodapé para um único lugar (parcial de HTML ou
  componente) se outras páginas forem reaproveitar o mesmo layout

As cores e fontes ficam todas no topo de `css/style.css`, nas variáveis
`:root` — é o lugar mais fácil pra ajustar a paleta depois.
