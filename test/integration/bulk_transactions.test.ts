describe("Bulk Transactions", () => {
  //   describe("POST /profile/:id/transactions/bulk", () => {
  //     let profile: any
  //     beforeAll(async (done) => {
  //       let profileDetails = {
  //         email: "cool_kid@looserville.com",
  //         balance: 20.59,
  //         currency: "EUR",
  //       }
  //       profile = await createProfile(profileDetails)
  //       done()
  //     })
  //     afterAll(async (done) => {
  //       const transactions = await getTransactions()
  //       transactions.map(async (trans) => {
  //         await deleteTransaction(trans.id)
  //       })
  //       await deleteProfile(profile.id)
  //       done()
  //     })
  //     test("it returns a list of transactions", async (done) => {
  //       request(server)
  //         .post(`/profile/${profile.id}/transactions/bulk`)
  //         .attach("file", "test/fixtures/transactions.csv")
  //         .expect(200)
  //         .then((response) => {
  //           expect(response.body).toEqual({
  //             message: "Success! 2 transaction(s) created",
  //           })
  //           done()
  //         })
  //     })
  //     test("after bulk process, there should be transactions", async (done) => {
  //       const transactionRepository = await getRepository(Transaction)
  //       transactionRepository.find({}).then((transactions: Transaction[]) => {
  //         expect(transactions.length).toEqual(2)
  //         done()
  //       })
  //     })
  //   })
  // })
})
