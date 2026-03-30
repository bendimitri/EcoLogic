# EcoLogic (mobile e multipaginas)

Aplicacao estatica para conectar reportadores de lixo e coletores em Curitiba, com foco em navegacao de celular.

## Telas

- `index.html`: login principal
- `login.html`: redirecionamento para `index.html` (compatibilidade)
- `cadastro.html`: cadastro
- `home.html`: painel principal por perfil
- `reportar.html`: mapa + formulario de reporte
- `feed.html`: feed de publicacoes
- `coletor.html`: pedidos para aceitar e abrir rota

## Requisitos implementados

- Seta de voltar no topo esquerdo das telas internas
- Menu no topo direito com opcoes de `Entrar` e `Sair`
- Persistencia local com `localStorage` e sessao em `sessionStorage`
- Mapa em Curitiba usando Leaflet + OpenStreetMap
- Fluxo inteligente de coleta:
  - se um coletor aceitar, outro nao consegue aceitar o mesmo post
  - coletor pode desistir e liberar o post para outros
  - coletor pode marcar como coletado e o post e removido
- CRUD para reportador no feed (editar e excluir seus proprios posts)
- Posts de exemplo automaticos para novos acessos

## Publicacao no GitHub Pages

Este projeto e 100% front-end (`HTML`, `CSS`, `JavaScript`) e pode ser publicado direto no GitHub Pages.

## Limite atual

Sem backend e sem banco de dados, entao os dados ficam apenas no navegador local de cada dispositivo.
