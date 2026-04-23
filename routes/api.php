<?php

use App\Models\User;
use App\Models\Assembly;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SundayServiceController; // <--- Import the controller
use App\Models\Evaluation;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// No middleware needed for login
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Requires Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    /**
     * Get current authenticated user
     *
     * @authenticated
     * @return User
     */
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /**
     * Get a list of all assemblies
     *
     * @authenticated
     * @return \Illuminate\Database\Eloquent\Collection<int, Assembly>
     */
    Route::get('/assemb', function () {
      return Evaluation::all();
    });

    /*
    |--------------------------------------------------------------------------
    | Sunday Services API
    |--------------------------------------------------------------------------
    | This single line automatically registers 5 endpoints:
    |
    | GET    /sunday-services           -> index()
    | POST   /sunday-services           -> store()
    | GET    /sunday-services/{service} -> show()
    | PUT    /sunday-services/{service} -> update()
    | DELETE /sunday-services/{service} -> destroy()
    */
    Route::apiResource('sunday-services', SundayServiceController::class);

});
