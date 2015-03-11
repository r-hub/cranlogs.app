
# The API of the CRAN downloads database

## General remarks

The output is JSON. API inspired by the
[`download-counts` npm package.](https://github.com/npm/download-counts)

## Total downloads over a period `/downloads/total/{period}[/{package1,package2,...}]`

The output looks like this:

```json
{
  downloads: 201761,
  start: "2014-06-01",
  end: "2014-06-30",
  package: "ggplot2"
}
```

If there was no package given, then that key is missing.

### Examples

All packages, last day:

> [`/downloads/total/last-day`](http://cranlogs.r-pkg.org/downloads/total/last-day)

All packages, specific date:

> [`/downloads/total/2014-02-01`](http://cranlogs.r-pkg.org/downloads/total/2014-02-01)


Package `ggplot2`, last week:

> [`/downloads/total/last-week/ggplot2`](http://cranlogs.r-pkg.org/downloads/total/last-week/ggplot2)


Package `ggplot2`, given 7-day period:

> [`/downloads/total/2014-02-01:2014-02-08/ggplot2`](http://cranlogs.r-pkg.org/downloads/total/2014-02-01:2014-02-08/ggplot2)


Package `ggplot2`, last 30 days:

> [`/downloads/total/last-month/ggplot2`](http://cranlogs.r-pkg.org/downloads/total/last-month/ggplot2)


Package "ggplot2", specific month:

> [`/downloads/total/2014-01-01:2014-01-31/ggplot2`](http://cranlogs.r-pkg.org/downloads/total/2014-01-01:2014-01-31/ggplot2)


Multiple packages at once:

> [`/downloads/total/last-day/igraph,ggplot2,Rcpp`](http://cranlogs.r-pkg.org/downloads/total/last-day/igraph,ggplot2,Rcpp)


### Accepted values

In general, dates in the `yyyy-mm-dd` ISO 8601 format are
accepted. The following keywords can also be used:

`last-day` Yesterday, unless the database has not been updated yet for yesterday,
in which case it is the day before.

`last-week` Last 7 available days.

`last-month` Last 30 available days.

## Daily downloads `/downloads/daily/{period}[/{package}]`

Output looks like this:

```json
{
    downloads: [
        {
            day: "2014-09-27",
            downloads: 1581
        },
        ...
        {
            day: "2014-10-04",
            downloads: 2395
        }
    ],
    start: "2014-09-27",
    end: "2014-10-04",
    package: "ggplot2"
}
```

Again, if no package was specified, then that key is missing.

### Examples

Downloads per day, last 7 days:

> [`/downloads/daily/last-week`](http://cranlogs.r-pkg.org/downloads/daily/last-week)


Downloads per day, specific 7 days:

> [`/downloads/daily/2014-02-07:2014-02-14`](http://cranlogs.r-pkg.org/downloads/daily/2014-02-07:2014-02-14)


Downloads per day, last 30 days:

> [`/downloads/daily/last-month/ggplot2`](http://cranlogs.r-pkg.org/downloads/daily/last-month/ggplot2)


Downloads per day, specific 30 day period:

> [`/downloads/daily/2014-01-03:2014-02-03/ggplot2`](http://cranlogs.r-pkg.org/downloads/daily/2014-01-03:2014-02-03/ggplot2)
