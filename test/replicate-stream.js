var create = require('./helpers/create')
var tape = require('tape')

tape('replicate through a stream', function (t) {
  const Stream = require('stream')
  const feed = create()

  feed.ready(function () {
    const feedRxCloneTx = new Stream.PassThrough()
    const feeding = feed.replicate({ live: true })

    const clone = create(feed.key)

    clone.ready(function () {
      const cloneRxFeedTx = new Stream.PassThrough()
      const cloning = clone.replicate({ live: true })

      feedRxCloneTx.pipe(feeding).pipe(cloneRxFeedTx)
      cloneRxFeedTx.pipe(cloning).pipe(feedRxCloneTx)

      feed.append('a', success(t))
      feed.append('b', success(t))
      feed.append('c', success(t))

      feed.get(0, same(t, 'a'))
      feed.get(1, same(t, 'b'))
      feed.get(2, same(t, 'c'))

      clone.get(0, same(t, 'a'))
      clone.get(1, same(t, 'b'))
      clone.get(2, same(t, 'c'))

      t.end()
    })
  })
})

tape('replicate duplex through streams', function (t) {
  const Stream = require('stream')
  const feed = create()

  feed.ready(function () {
    const feedRxCloneTx = new Stream.PassThrough()
    const feeding = feed.replicate({ live: true })

    const clone = create(feed.key) // create(feed.key, { writable: true }) // Fails, "Feed is not writable"

    clone.ready(function () {
      const cloneRxFeedTx = new Stream.PassThrough()
      const cloning = clone.replicate({ live: true })

      feedRxCloneTx.pipe(feeding).pipe(cloneRxFeedTx)
      cloneRxFeedTx.pipe(cloning).pipe(feedRxCloneTx)

      feed.append('a', success(t))
      feed.append('b', success(t))
      feed.append('c', success(t))

      feed.get(0, same(t, 'a'))
      feed.get(1, same(t, 'b'))
      feed.get(2, same(t, 'c'))

      clone.get(0, same(t, 'a'))
      clone.get(1, same(t, 'b'))
      clone.get(2, same(t, 'c'))

      clone.append('d', success(t)) // Fails, "This feed is not writable. Did you create it?"
      clone.append('e', success(t))
      clone.append('f', success(t))

      clone.get(3, same(t, 'd'))
      clone.get(4, same(t, 'e'))
      clone.get(5, same(t, 'f'))

      feed.get(3, same(t, 'd'))
      feed.get(4, same(t, 'e'))
      feed.get(5, same(t, 'f'))

      t.end()
    })
  })
})

function success (t) {
  return function (err) {
    t.error(err, 'no error')
  }
}

function same (t, val) {
  return function (err, data) {
    t.error(err, 'no error')
    t.same(data.toString(), val)
  }
}
