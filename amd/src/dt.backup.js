/**
 * Converts a unix timestamp to something that is human readable
 *
 * @param divTimeStr
 * @returns {string}
 * @constructor
 */
function ConvertDateFromDiv(divTimeStr) {
    //eg:-divTimeStr=18/03/2013 12:53:00
    var tmstr = divTimeStr.toString().split(' ') //'21-01-2013 PM 3:20:24'
    var dt = tmstr[0].split('/')
    var str = dt[2] + "/" + dt[1] + "/" + dt[0] + " " + tmstr[1] //+ " " + tmstr[1]//'2013/01/20 3:20:24 pm'
    var time = new Date(str)
  
    if (time == "Invalid Date") {
        time = new Date(divTimeStr)
    }
  
    return time.toLocaleDateString()
  }
  
  /**
  * Returns a success icon if true, and a danger icon if not
  *
  * @param bool
  * @returns {string}
  */
  function getIcon(bool) {
    if(bool){
        return '<i class="fa fa-check text-success fa-fw"></i>'
    } else {
        return '<i class="fa fa-times text-danger fa-fw"></i>'
    }
  }
  
  /**
  * Returns an icon clause
  *
  * @param status
  * @returns {string}
  */
  function getStatusIcon(status) {
    if(status === 'check') {
        return '<i class="fa fa-exclamation text-warning fa-fw"></i>'
    } else if(status === 'fail') {
        return '<i class="fa fa-exclamation-triangle text-warning fa-fw"></i>'
    } else if (status === 'error') {
        return '<i class="fa fa-times text-danger fa-fw"></i>'
    } else if (status === 'pass') {
        return '<i class="fa fa-check text-success fa-fw"></i>'
    }
  }
  
  /**
  * Parse teachers out of the courseinfo object
  *
  * @param course
  * @returns {Array}
  */
  function parseTeachers(course) {
    let teachers = ''
  
    Object.entries(course).forEach(([key, val]) => {
        if (key === 'teachers') {
            Object.entries(val).forEach(([teacherId, teacherInfo]) => {
                teachers += teacherInfo.firstname + ' ' + teacherInfo.lastname + '<br>'
            })
        }
    })
  
    return teachers
  }
  
  define(['jquery', 'theme_boost/dataTables'], function($, DataTable) {

    return {
        
        function (token) {
  
            const domain = 'https://mappt.swarthmore.edu'
            const f = 'block_filescan_request_files'
            const api = domain + '/webservice/rest/server.php' + '?wstoken=' + token + '&wsfunction=' + f + '&moodlewsrestformat=' + 'json'
  
            $(document).ready(function () {

                alert("hello");

                $('#myTable').DataTable({
                    "processing": true,
                    "serverSide": true,
                    "ajax": {
                        "url": api,
                        "cache": true // this removes _ from being returned
                    },
                    "columnDefs": [
                        {
                            "targets": "id",
                            "visible": false
                        }
                    ],
                    "buttons": [
                        {
                            extend: 'collection',
                            text: 'Export',
                            buttons: [
                                'copy',
                                'excel',
                                'csv',
                                'pdf',
                                'print'
                            ]
                        }
                    ],
                    "columns": [
                        {
                            "data": "status",
                            "className": "text-center",
                            "render": data => getStatusIcon(data)
                        },
                        {
                            "data": "hastext",
                            "className": "text-center",
                            "render": data => getIcon(data)
                        },
                        {
                            "data": "hastitle",
                            "className": "text-center",
                            "render": data => getIcon(data)
                        },
                        {
                            "data": "hasoutline",
                            "className": "text-center",
                            "render": data => getIcon(data)
                        },
                        {
                            "data": "haslanguage",
                            "className": "text-center",
                            "render": data => getIcon(data)
                        },
                        {
                            "data": "timechecked",
                            "className": "text-center",
                            "render": data => { return ConvertDateFromDiv(Date.parse(data)) }
                        },
                        {
                            "data": "courseinfo",
                            "render": (data, type, row, meta) => {
                                let url = '/course/view.php?id='
  
                                if (data) {
                                    let d = JSON.parse(data)
                                    let courses = []
  
                                    d.forEach(course => {
                                        let courseUrl = url + course.courseid
                                        let enrolled = course.student_enrollment
  
                                        let teachers = parseTeachers(course)
  
                                        if (course) {
                                            courses.push(
  
                                                `<ul class="list-group list-fix">` +
  
                                                `<li class="list-group-item">` +
                                                `<div class="row mb-3">` +
                                                `<div class="col-sm-2"><strong>Course: </strong></div>` +
                                                `<div class="col-sm"><a href="${courseUrl}" style="border-bottom: 1px dashed royalblue; padding-bottom: 3px;">${course.shortname}</a></div>` +
                                                `</div>` +
                                                `</li>` +
  
                                                `<li class="list-group-item">` +
                                                `<div class="row mb-3">` +
                                                `<div class="col-sm-2"><strong>Teachers: </strong></div>` +
                                                `<div class="col-sm">${teachers}</div>` +
                                                `</div>` +
                                                `</li>` +
  
                                                `<li class="list-group-item">` +
                                                `<div class="row mb-3">` +
                                                `<div class="col-sm-2"><strong>Students Enrolled: </strong></div>` +
                                                `<div class="col-sm">${enrolled}</div>` +
                                                `</div>` +
                                                `</li>` +
  
                                                `<li class="list-group-item">` +
                                                `<div class="row mb-3">` +
                                                `<div class="col-sm-2"><strong>File: </strong></div>` +
                                                `<div class="col-sm"><a href="https://mappt.swarthmore.edu/mod/resource/view.php?id=${course.instance_id}" style="border-bottom: 1px dashed royalblue; padding-bottom: 3px;">${course.filename}</a></div>` +
                                                `</div>` +
                                                `</li>` +
                                                `</ul>`
  
                                            )
                                        } else {
                                            courses.push('No course information found. This may be an invalid courseinfo entry within the block_filescan_files table.')
                                        }
                                    })
                                    return courses.join('<br>')
                                } else {
                                    return `No response returned from the DataTables service. Are you sure the course exists?<br><strong>Ref id: ${row['id']}</strong>`
                                }
                            }
                        }
                    ]
                })
  
            })
  
        }
    }
  })