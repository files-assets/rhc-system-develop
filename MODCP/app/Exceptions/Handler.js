'use strict'

const BaseExceptionHandler = use('BaseExceptionHandler')
const Env = use('Env')

/**
 * Error class handler.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle.
   *
   * @method handle
   */
  async handle ({ code, name, status = 500 }, { request, response }) {
    response.status(status)

    /**
     * If the request accepts JSON or it is running by AJAX,
     * send the error in JSON format.
     */
    if (request.accepts(['json', 'html']) === 'json' || request.ajax()) {
      return response.json({
        error: true,
        error_code: status,
        error_message: ({
          500: 'Internal server error',
          404: 'Page not found',
          401: 'Unauthorized'
        })[status]
      })
    }

    /** Handle E_INVALID_SESSION error: */
    if (code === 'E_INVALID_SESSION') {
      return this._handleInvalidSession(...arguments)
    }

    /** Handle 404 error: */
    if (name === 'HttpException' && status === 404) {
      return this._handle404(...arguments)
    }

    /** If is in development: */
    if (Env.get('NODE_ENV') === 'development') {
      return super.handle(...arguments)
    }

    /** Handle 500 error (in production): */
    return this._handle500(...arguments)
  }

  /**
   * Handle invalid session error.
   *
   * @method _handleInvalidSession
   */
  async _handleInvalidSession (error, { response, view }) {
    return response.send(view.render('errors.401'))
  }

  /**
   * Handle 404 HTTP error.
   *
   * @method _handle404
   */
  async _handle404 (error, { response, view }) {
    return response.send(view.render('errors.404'))
  }

  /**
   * Handle 500 HTTP error.
   *
   * @method _handle500
   */
  async _handle500 (error, { response, view }) {
    return response.send(view.render('errors.500'))
  }
}

module.exports = ExceptionHandler
