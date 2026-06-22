# Front Projeto Extensao 2026

Esse projeto comporta a estrutura de Front End do projeto extensão

## GitHub Pages

Este repositório publica em:

- https://carlosfpr01.github.io/ProjetoExt20261/

> Observação: `https://carlosfpr01.github.io` só funciona sem sufixo quando existe um repositório separado chamado `carlosfpr01.github.io`.

## Configuração do Backend (CORS)

Para que o frontend hospedado no GitHub Pages consiga se comunicar com o backend, o backend **precisa** retornar o cabeçalho CORS `Access-Control-Allow-Origin` nas respostas. Sem esse cabeçalho, o navegador bloqueia as requisições.

Configure o backend para aceitar a origem do GitHub Pages:

```
Access-Control-Allow-Origin: https://carlosfpr01.github.io
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Em Spring Boot, adicione uma configuração global de CORS (por exemplo, uma classe anotada com `@Configuration` que exponha um `CorsFilter` ou use `WebMvcConfigurer#addCorsMappings`).

## Variável de ambiente do backend

O endereço do backend é definido na variável `VITE_API_BASE_URL`. Para o deploy no GitHub Pages usar a URL correta, crie uma **variável de repositório** (Settings → Secrets and variables → Actions → Variables) chamada `VITE_API_BASE_URL` com o endereço do backend (ex.: `https://meu-backend.exemplo.com`). O workflow de deploy passa essa variável automaticamente para o build.

> Se a variável `VITE_API_BASE_URL` **não** estiver configurada no repositório, o build usará o valor padrão definido em `vite.config.ts` (`https://fantastic-potato-r4gpqxjj7v693x59g-8080.app.github.dev`). Nesse caso, certifique-se de que esse endereço esteja acessível e com CORS configurado.
