[![npm](https://img.shields.io/npm/v/fine-uploader-wrappers.svg)](https://www.npmjs.com/package/fine-uploader-wrappers)
[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](LICENSE)
[![Build Status](https://travis-ci.org/FineUploader/fine-uploader-wrappers.svg?branch=master)](https://travis-ci.org/FineUploader/fine-uploader-wrappers)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/fine-uploader-wrap.svg)](https://saucelabs.com/u/fine-uploader-wrap)

These wrap a Fine Uploader instance as ES6 classes and provide additional features such as the ability to dynamically register multiple event/callback listeners. These classes are requirements in projects such as [React Fine Uploader](https://github.com/FineUploader/react-fine-uploader) and [Vue Fine Uploader](https://github.com/FineUploader/vue-fineuploader), among others.

## Docs

### Quick Reference

- [Installing](#installing)
- [Wrapper Classes](#wrapper-classes)
   - [Azure](#azure) - upload files directly to Azure storage
   - [S3](#s3) - upload files to directly to an Amazon Simple Storage Service (S3) bucket. Your server must sign requests using a private key.
   - [Traditional](#traditional) - upload files to a server you created and control.

### Installing

If you require support for IE11, you'll need to install an A+/Promise spec compliant polyfill. To install this wrapper classes package, simply `npm install fine-uploader-wrappers` and see the documentation below for your specific integration instructions (based on your needs).

You'll also need to explicitly install [Fine Uploader](https://github.com/FineUploader/fine-uploader). See the `peerDependencies` section of this project's `package.json` for acceptable version.

### Wrapper Classes

Note: You can access the entire `qq` namespace on any uploader instance. For example, if you are using Fine Uploader S3, and want to access the `status` object, your code may look something like this:

```js
const uploader = new FineUploaderS3({ ... })
const queuedFileStatus = uploader.qq.status.QUEUED
```

#### Azure

This enables you to upload to Azure directly. Your server must provide signature and done endpoints. The Azure uploading workflow is documented on the [Azure feature page](http://docs.fineuploader.com/branch/master/features/azure.html). Some examples servers can be found in the [server-examples repository](https://github.com/FineUploader/server-examples).

##### `constructor({ options })`

When creating a new instance of the Azure endpoint wrapper class, pass in an object that mirrors the format of the [Fine Uploader Azure Core options object](http://docs.fineuploader.com/branch/master/api/options-azure.html). This options property is entirely optional.

```javascript
import FineUploaderAzure from 'fine-uploader-wrappers/azure'

const uploader = new FineUploaderAzure({
    options: {
      signature: {
        endpoint: '/upload/signature',
      },
      uploadSuccess: {
        endpoint: '/upload/done',
      }
    }
})
```

##### `on(eventName, handlerFunction)`

Register a new callback/event handler. The `eventName` can be formatted with _or_ without the 'on' prefix. If you do use the 'on', prefix, be sure to follow lower-camel-case exactly ('onSubmit', not 'onsubmit'). If a handler has already been registered for this event, yours will be added to the "pipeline" for this event. If a previously registered handler for this event fails for some reason or returns `false`, you handler will _not_ be called. Your handler function may return a `Promise` if it is [listed as an event type that supports promissory/thenable return values](http://docs.fineuploader.com/branch/master/features/async-tasks-and-promises.html#promissory-callbacks).

```javascript
uploader.on('complete', (id, name, response) => {
   // handle completed upload
})
```

##### `off(eventName, handlerFunction)`

Unregister a previously registered callback/event handler. Same rules for `eventName` as  the `on` method apply here. The `handlerFunction` _must_ be the _exact_ `handlerFunction` passed to the `on` method when you initially registered said function.

```javascript
const completeHandler = (id, name, response) => {
   // handle completed upload
})

uploader.on('complete', completeHandler)

// ...later
uploader.off('complete', completeHandler)
```

##### `options`

The `options` property you used when constructing a new instance, sans any `callbacks`.

##### `methods`

Use this property to access any [core API methods exposed by Fine Uploader Azure](http://docs.fineuploader.com/branch/master/api/methods-azure.html).

```javascript
uploader.methods.getResumableFilesData(myFiles)
```


#### S3

Use the traditional endpoint wrapper class if you would like to upload files directly to an Amazon Simple Storage Service (S3 bucket). Your server must be able to sign requests sent by Fine Uploader. If you enable the delete file feature, your server must handle these as well. You can read more about [S3 server requests in the documentation](http://docs.fineuploader.com/branch/master/endpoint_handlers/amazon-s3.html). The S3 uploading workflow is documented on the [S3 feature page](http://docs.fineuploader.com/branch/master/features/s3.html). Some examples servers can be found in the [server-examples repository](https://github.com/FineUploader/server-examples).

##### `constructor({ options })`

When creating a new instance of the S3 endpoint wrapper class, pass in an object that mirrors the format of the [Fine Uploader S3 Core options object](http://docs.fineuploader.com/branch/master/api/options-s3.html). You may also include a `callbacks` property to include any initial [core callback handlers](http://docs.fineuploader.com/branch/master/api/events-s3.html) that you might need. This options property is entirely optional though :laughing:.

```javascript
import FineUploaderS3 from 'fine-uploader-wrappers/s3'

const uploader = new FineUploaderS3({
    options: {
        request: {
            endpoint: "http://fineuploadertest.s3.amazonaws.com",
            accessKey: "AKIAIXVR6TANOGNBGANQ"
        },
        signature: {
            endpoint: "/vendor/fineuploader/php-s3-server/endpoint.php"
        }
    }
})
```

##### `on(eventName, handlerFunction)`

Register a new callback/event handler. The `eventName` can be formatted with _or_ without the 'on' prefix. If you do use the 'on', prefix, be sure to follow lower-camel-case exactly ('onSubmit', not 'onsubmit'). If a handler has already been registered for this event, yours will be added to the "pipeline" for this event. If a previously registered handler for this event fails for some reason or returns `false`, you handler will _not_ be called. Your handler function may return a `Promise` if it is [listed as an event type that supports promissory/thenable return values](http://docs.fineuploader.com/branch/master/features/async-tasks-and-promises.html#promissory-callbacks).

```javascript
uploader.on('complete', (id, name, response) => {
   // handle completed upload
})
```

##### `off(eventName, handlerFunction)`

Unregister a previously registered callback/event handler. Same rules for `eventName` as  the `on` method apply here. The `handlerFunction` _must_ be the _exact_ `handlerFunction` passed to the `on` method when you initially registered said function.

```javascript
const completeHandler = (id, name, response) => {
   // handle completed upload
})

uploader.on('complete', completeHandler)

// ...later
uploader.off('complete', completeHandler)
```

##### `options`

The `options` property you used when constructing a new instance, sans any `callbacks`.

##### `methods`

Use this property to access any [core API methods exposed by Fine Uploader S3](http://docs.fineuploader.com/branch/master/api/methods-s3.html).

```javascript
uploader.methods.addFiles(myFiles)
uploader.methods.deleteFile(3)
```

#### Traditional

Use the traditional endpoint wrapper class if you would like to upload files to a server you control. Your server must handle _all_ requests sent by Fine Uploader, such as upload, delete file (optional), and chunking success (optional). You can read more about [traditional server requests in the documentation](http://docs.fineuploader.com/branch/master/endpoint_handlers/traditional.html). Some examples servers can be found in the [server-examples repository](https://github.com/FineUploader/server-examples).

##### `constructor({ options })`

When creating a new instance of the traditional endpoint wrapper class, pass in an object that mirrors the format of the [Fine Uploader Core options object](http://docs.fineuploader.com/branch/master/api/options.html). You may also include a `callbacks` property to include any initial [core callback handlers](http://docs.fineuploader.com/branch/master/api/events.html) that you might need. This options property is entirely optional.

```javascript
import FineUploaderTraditional from 'fine-uploader-wrappers'

const uploader = new FineUploaderTraditional({
   options: {
      request: {
         endpoint: 'my/upload/endpoint'
      },
      callbacks: {
         onComplete: (id, name, response) => {
            // handle completed upload
         }
      }
   }
})
```

##### `on(eventName, handlerFunction)`

Register a new callback/event handler. The `eventName` can be formatted with _or_ without the 'on' prefix. If you do use the 'on', prefix, be sure to follow lower-camel-case exactly ('onSubmit', not 'onsubmit'). If a handler has already been registered for this event, yours will be added to the "pipeline" for this event. If a previously registered handler for this event fails for some reason or returns `false`, you handler will _not_ be called. Your handler function may return a `Promise` iff it is [listed as an event type that supports promissory/thenable return values](http://docs.fineuploader.com/branch/master/features/async-tasks-and-promises.html#promissory-callbacks).

```javascript
uploader.on('complete', (id, name, response) => {
   // handle completed upload
})
```

##### `off(eventName, handlerFunction)`

Unregister a previously registered callback/event handler. Same rules for `eventName` as  the `on` method apply here. The `handlerFunction` _must_ be the _exact_ `handlerFunction` passed to the `on` method when you initially registered said function.

```javascript
const completeHandler = (id, name, response) => {
   // handle completed upload
})

uploader.on('complete', completeHandler)

// ...later
uploader.off('complete', completeHandler)
```

##### `options`

The `options` property you used when constructing a new instance, sans any `callbacks`.

##### `methods`

Use this property to access any [core API methods exposed by Fine Uploader](http://docs.fineuploader.com/branch/master/api/methods.html).

```javascript
uploader.methods.addFiles(myFiles)
uploader.methods.deleteFile(3)
```
