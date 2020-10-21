const {expect, test} = require('@oclif/test')

describe('Portainer', () => {
  test
  .stdout()
  .command(['Portainer'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['Portainer', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
