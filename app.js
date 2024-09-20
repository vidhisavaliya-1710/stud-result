var express=require('express');
var bodyParser = require('body-parser');
var mysql=require('mysql');
const storage = require('node-persist');


storage.init();
var app=express();
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({ extended: false }))



var con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'login'
})

con.connect()


app.get('/admin',async function(req,res){
    
    var user_id=await storage.getItem('user_id');
    if(user_id==undefined){
    res.render("login")
    }
    else{
        res.redirect("/admin/student")
    }
})

app.post('/admin',function(req,res){
    
    var query="select * from admin where email='"+req.body.email+"' and password='"+req.body.password+"'";
    con.query(query,async function(err,result){
        if(err) throw err;
            if(result.length==1){

                await storage.setItem('user_id','1');
                res.redirect("/admin/student")
            }
            else{
                res.send("invaild email or password")
            }
            
    })
    
})

app.get('/admin/reg',function(req,res){
    res.render("index")
})

app.post('/admin/reg',function(req,res){
    var insert_query="insert into admin(name,email,password) values ('"+req.body.name+"','"+req.body.email+"','"+req.body.password+"')";
    con.query(insert_query,function(err,result){
        if(err) throw err;
        res.redirect('/admin/reg')
    })
})

app.get('/admin/student',async function(req,res){
    var user_id=await storage.getItem('user_id');
    if(user_id==undefined){
        res.redirect("/admin")
    }
    res.render("stud")
})
// insert student record
app.post('/admin/student',function(req,res){
    
    var insert_query="insert into stud(name,division,stdd) values ('"+req.body.name+"','"+req.body.division+"','"+req.body.stdd+"')";
    con.query(insert_query,function(err,result){
        if(err) throw err;
        res.redirect("/admin/student")
    })
})

// view student details
app.get('/admin/studview',function(req,res){
    var select_query="select * from stud";
    con.query(select_query,function(err,result){
        if(err) throw err;
        res.render("studview",{result})
    })
   
})

// delete record student details
app.post('/admin/studview/del',function(req,res){
    var del_query="delete from stud where id="+req.body.id;
    con.query(del_query,function(err,result){
        if(err) throw err;
        res.redirect("/admin/studview")
    })
})

// update record student details
app.get('/admin/studview/update',function(req,res){
    res.render("studupdate");
})
app.post('/admin/studview/update',function(req,res){
    var update_query="update stud set name='"+req.body.name+"', division='"+req.body.division+"', stdd='"+req.body.stdd+"' where id="+req.body.id;
    con.query(update_query,function(err,result){
        if(err) throw err;
        res.redirect("/admin/studview")
    })
})

// insert record result
app.get('/admin/result',function(req,res){
    res.render("result")
})

app.post('/admin/result',function(req,res){
    const {name,division,stdd,sub1,sub2,sub3,sub4,sub5}=req.body;
    var total=parseInt(sub1)+parseInt(sub2)+parseInt(sub3)+parseInt(sub4)+parseInt(sub5)
    var per=(parseInt(sub1)+parseInt(sub2)+parseInt(sub3)+parseInt(sub4)+parseInt(sub5))/5
    var garde;
    if(per>85){
        garde ="A+"
    }
    
    else if(per>70){
        garde="B+"
    }
    else{
        garde="C"
    }

    // pass Fail ATKT
    var resu;
    if(per>60){
        resu="PASS";
    }
    else if(per>40){
        resu="Fail";
    }
    else{
        resu="ATKT";
    }
    var insert_result=`insert into stud_result(name,division,stdd,sub1,sub2,sub3,sub4,sub5,total,per,garde,result) values (?,?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [name, division, stdd, sub1, sub2, sub3, sub4, sub5, total,per,garde,resu];
    
    con.query(insert_result, values,function(err,result){
        if(err) throw err;
        res.redirect("/admin/result")
    })
})

// display student result

app.get('/admin/resultview',function(req,res){
    var select_que="select * from stud_result";
    con.query(select_que,function(err,result){
        if(err) throw err;
        res.render("viewresult",{result})
    })
})

// student side
app.get('/',function(req,res){
    res.render("view")
})
app.post('/',function(req,res){
    var views="select * from stud_result where id='"+req.body.id+"' and division='"+req.body.division+"' and stdd='"+req.body.stdd+"'";
    con.query(views,function(err,result){
        if(err) throw err;
        res.render("studmark",{result})
    })
})

app.get("/logout",async function(req,res){
    storage.clear();
    res.redirect("/admin")
})

app.listen(3000)