import { html, fixture, expect } from '@open-wc/testing';
import "../sports-association-project.js";

describe("SportsAssociationProject test", () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`
      <sports-association-project
        title="title"
      ></sports-association-project>
    `);
  });

  it("basic will it blend", async () => {
    expect(element).to.exist;
  });

  it("passes the a11y audit", async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
