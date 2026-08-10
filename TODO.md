# TODO

## Migrar discovery de containers de volta para label-only

**Estado atual (temporário):** `GET /api/containers` retorna **todos** os containers rodando (`DockerClient.listAllContainers`), pra facilitar escolher qualquer container no picker do form sem precisar já ter configurado labels.

**Estado alvo:** só retornar containers com a label `better-nginx.enable=true` (`DockerClient.listEnabledContainers`, já implementado e em uso no auto-discovery/auto-apply — isso não mudou).

Quando migrar:
1. Trocar `deps.docker.listAllContainers()` por `deps.docker.listEnabledContainers()` em `src/http/app.ts` (rota `GET /api/containers`)
2. Remover `listAllContainers` de `src/ports/docker-client.ts` e `toDiscoveredAny`/implementação correspondente em `src/adapters/dockerode-adapter.ts`
3. Atualizar `web/src/App.tsx` e `web/src/ServerBlockForm.tsx` (mensagens de "nenhum container encontrado" já mencionam a label, não deve precisar mudar nada ali)
4. Atualizar README se necessário (hoje já documenta a convenção de labels)

**Por quê isso está assim agora:** decisão consciente de trade-off pra destravar o uso do picker antes de todo mundo já ter as labels configuradas nos containers existentes. Não é o comportamento final.
