import React, { useState } from "react";  
import { render } from 'react-dom';
import FlashMessage from 'react-flash-message'
import { read, utils, writeFile } from 'xlsx';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from "react-router-dom";
import { redirect } from "react-router-dom";



const NewEbookExcelForm= (props) => {
    const [ebooks, setEbooks] = useState([]);
    const publishers=props.publishers.filter(pub=>pub.name);
    const navigate=useNavigate();
    
    const Message = (message,color) => (
        <FlashMessage duration={3000}>
            <Alert variant={color}>
                <strong>{message}</strong>
            </Alert>
        </FlashMessage>
      )

    const handleImport = ($event) => {
        const files = $event.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;

                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    setEbooks(rows)
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }

    const handleExport = () => {
        const headings = [[
            'Title',
            'Publisher',
            'Author',
            'Link'
        ]];
        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, ebooks, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');
        writeFile(wb, 'Movie Report.xlsx');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(ebooks!==[]){
                try {
                    let res = await fetch("http://localhost:7000/multiple-new-ebook", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                        ebooks,
                        publishers
                      }),
                      redirect: 'follow'
                    }).then(response => response.json())
                    .then(data => {
                      // Handle the response data here
                      render(Message(data.message,data.color),document.getElementById("Flash"));
                      redirect('/admin/new-ebook/excel')
                    });
                    
                  } catch (err) {
                    console.log(err);
                  }
        }
        
        
      };

    return (
        <>
            <div className="row mb-2 mt-5" >
                <div id="Flash">

                </div>
                <div className="col-sm-6 mx-auto">
                    <div className="row">
                        <div className="col-md-6 ">
                            <div className="input-group">
                                <div className="custom-file">
                                    <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={handleImport}
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"/>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 text-center">
                            <button onClick={handleExport} className="btn btn-primary float-right ">
                                Export <i className="fa fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-6 mx-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Id</th>
                                <th scope="col">Title</th>
                                <th scope="col">Publisher</th>
                                <th scope="col">Author</th>
                                <th scope="col">Link</th>
                            </tr>
                        </thead>
                        <tbody> 
                                {
                                    ebooks.length
                                    ?
                                    ebooks.map((ebooks, index) => (
                                        <tr key={index}>
                                            <th scope="row">{ index + 1 }</th>
                                            <td>{ ebooks.Title }</td>
                                            <td>{ ebooks.Publisher }</td>
                                            <td>{ ebooks.Author }</td>
                                            <td><span className="badge bg-warning text-dark">{ ebooks.Link }</span></td>
                                        </tr> 
                                    ))
                                    :
                                    <tr>
                                        <td colSpan="5" className="text-center">No Ebooks Found.</td>
                                    </tr> 
                                }
                        </tbody>
                    </table>
                </div>
            </div>
            <Form onSubmit={handleSubmit} className="p-4">
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </>

    );
};

export  {NewEbookExcelForm};