const gulp = require( "gulp" );
const cleanwxss = require( "gulp-cleanwxss" );

gulp.task( "default", (done) => {
    gulp.src( "../components/**/**.wxss" )
        .pipe( cleanwxss( {
            log:true,
        }))
        .pipe( gulp.dest( "../dist" ) );

    done();
} );
