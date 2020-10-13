const sqlPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
        const {query, values} = sqlPartialUpdate(
          "companies",
          {name: "Test"},
          "handle",
          "testcompany"
        )

        expect(query).toEqual(
          'UPDATE companies SET name=$1 WHERE handle=$2 RETURNING *'
        )
        expect(values).toEqual(['Test', 'testcompany']);
  });
});
