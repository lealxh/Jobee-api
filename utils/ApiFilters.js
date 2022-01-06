class ApiFilters {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  filter() {
    const queryCopy = { ...this.queryStr }

    // Advance filter using: lt, lte, gt, gte
    let queryStr = JSON.stringify(queryCopy)
    console.log(this.queryStr)
    console.log(queryStr.match(/\b(gt|gte|lt|lte|in)\b/g))
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    console.log(queryStr)
    this.query = this.query.find(JSON.parse(queryStr))
    return this
  }
}
module.exports = ApiFilters
