import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AvisModels } from "../../core/models/avis.models";
import { AvisService } from "../../core/services/avis.service";
import { jsPDF } from 'jspdf';
import {DatePipe} from "@angular/common";
import {WorkersService} from "../../core/services/workers.service";
import {UsersService} from "../../core/services/users.service";

@Component({
    selector: 'app-list-avis',
    templateUrl: './list-avis.component.html',
    styleUrls: ['./list-avis.component.scss']
})
export class ListAvisComponent implements OnInit {
    @ViewChild('pdfContainer') pdfContainer: ElementRef;

    avisList: AvisModels[];
    p: number = 1; // Current page number
    itemsPerPage: number = 5; // Number of items per page
    searchTerm: string = '';
    user: any;
    userType: string | null = '';
    errorMessage: string;

    constructor(private avisService: AvisService,
                private usersService: UsersService,
                private workersService: WorkersService,
                private datePipe: DatePipe) { }

    ngOnInit() {
        this.loadAvis();
        this.userType = localStorage.getItem('userType');
        const userEmail = localStorage.getItem('userMail');

        if (this.userType && userEmail) {
            if (this.userType === 'user') {
                this.fetchUserProfile(userEmail);
            } else if (this.userType === 'worker') {
                this.fetchWorkerProfile(userEmail);
            } else {
                this.errorMessage = 'Invalid user type.';
            }
        } else {
            this.errorMessage = 'User information not found in local storage.';
        }
    }

    loadAvis() {
        this.avisService.getAllAvis().subscribe(
            avisList => {
                this.avisList = avisList;
                console.log('Avis list:', this.avisList);
            },
            error => {
                console.error('Error loading avis list', error);
            }
        );
    }

    PrintToPdf(avis: AvisModels) {
        const formattedDate = this.datePipe.transform(avis.createdAt, 'dd/MM/yyyy');

        const htmlContent = `

        
      <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="fr" lang="fr">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>bf024b86-fbd8-4ca7-b91f-c9f2b821693c</title>
    <meta name="author" content="Ahmed Messaoud">
    <style type="text/css">
        * {margin:0; padding:0; text-indent:0; }
         .s1 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 13.5pt; }
         .s2 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 8.5pt; }
         .s3 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 11pt; }
         .s4 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 8pt; }
         .s5 { color: #F00; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 10pt; }
         .s6 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 10pt; }
         .s7 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: bold; text-decoration: none; font-size: 11.5pt; }
         .s8 { color: #F00; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 8.5pt; }
         .s9 { color: black; font-family:Arial, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 11pt; }
         .s10 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 10pt; }
         .s11 { color: black; font-family:Calibri, sans-serif; font-style: normal; font-weight: normal; text-decoration: none; font-size: 11pt; }
         table, tbody {vertical-align: top; overflow: visible; }
    </style>
</head>

<body>
    <table style="border-collapse:collapse;margin-left:7.069pt" cellspacing="0">
        <tbody>
            
            <tr style="height:4pt">
                <td style="width:487pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="7">
                    <p style="text-indent: 0pt;text-align: left;">
                        <table class="container" style="width: 100%; border-collapse: collapse;"> 
                        <tbody><tr style="height: 51pt; border: 1pt solid; border-right-width: 1pt;">
                         <td style="width: 25%; border-right: 1pt solid; padding: 10pt; text-align: left;"> 
                         <div style="margin-bottom: 10pt;"> <img width="118" height="57" src="assets/images/logoprodelec2024.png" alt="Logo"> </div> </td> 
                         <td style="width: 50%; padding: 10pt; text-align: left;border-right: 1pt solid;">
                          <p style="margin: 0; padding-top: 1pt;">&nbsp;</p>
                            <p style=" margin: 0; text-align: center;">ENQUETE DE SATISFACTION CLIENT</p>                            </td> <td style="width: 25%; padding: 10pt;left: 1pt solid; text-align: left;">
                             <p style="margin: 0; padding-top: 8pt;">Réf: R01-FO-05</p>
                              <p style="margin: 0; padding-top: 1pt;">Version : 01</p>
                               <p style="margin: 0; padding-top: 1pt;">Date : 28/07/2020</p> </td>
                                </tr>
                                 </tbody>
                                 </table>
                    </p>
                </td>
            </tr>
            <tr style="height:81pt">
                <td style="width:487pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="7">
                    <p class="s3" style="padding-top: 4pt;padding-left: 1pt;text-indent: 0pt;text-align: left;">Questionnaire ci-après,</p>
                    <p class="s4" style="padding-left: 1pt;text-indent: 0pt;text-align: left;">L'exploitation de vos réponses nous aidera à améliorer nos prestations afin de renforcer votre satisfaction.</p>
                    <p style="padding-top: 2pt;text-indent: 0pt;text-align: left;">
                        <br>
                    </p>
                    <p class="s4" style="padding-left: 1pt;text-indent: 0pt;text-align: left;">En vous remerciant par avance et restant attentif à vos Suggestions, je vous prie de croire, Cher Client, en l'expression de nos sincères salutations.</p>
                    <p class="s4" style="padding-left: 26pt;text-indent: 0pt;text-align: left;">-<span class="s5">▲▲▲ </span>= satisfaction forte- - <span class="s5">▲▲ </span>= satisfaction correcte- - <span class="s5">► </span>=Faible - -<span class="s6">▼ </span>= inacceptable-</p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:26pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-right-style:solid;border-right-width:2pt" rowspan="31">
                    <p style="text-indent: 0pt;text-align: left;">
                        <br>
                    </p>
                </td>
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 78pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Concernant nos devis</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
                <td style="width:30pt;border-top-style:solid;border-top-width:2pt;border-right-style:solid;border-right-width:2pt" rowspan="31">
                    <p style="text-indent: 0pt;text-align: left;">
                        <br>
                    </p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s10" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Conformités à vos exigences</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteExigences === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteExigences === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteExigences === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteExigences === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s10" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Clarté / simplicité</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.clartesimplicite === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.clartesimplicite === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.clartesimplicite === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.clartesimplicite === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s10" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Délai de réponse</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaidereponse === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaidereponse === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaidereponse === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaidereponse === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                       ${avis.deviscomm === null ? "" : avis.deviscomm}
                    </p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 23pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Comment le client juge t-il notre réactivité :</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">A ses demandes d'ordre technique</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteTechnique === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteTechnique === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteTechnique === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteTechnique === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">A ses réclamations</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteReclamations === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteReclamations === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteReclamations === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteReclamations === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">A ses aspects d'offres et ses consultations</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteOffres === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteOffres === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteOffres === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactiviteOffres === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                        ${avis.reactivitecomm === null ? "" : avis.reactivitecomm}
                    </p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 89pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Développement:</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Gamme de produits</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.gammeproduits === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.gammeproduits === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.gammeproduits === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.gammeproduits === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Aptitude à suivre les évolutions technologiques</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.evolutionsTechnologiques === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.evolutionsTechnologiques === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.evolutionsTechnologiques === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.evolutionsTechnologiques === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Performance en etude et conception</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.performanceEtude === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.performanceEtude === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.performanceEtude === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.performanceEtude === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                        ${avis.develocomm === null ? "" : " "+avis.develocomm}
                    </p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 42pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Concernant nos prestations/produit</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Conformité produit</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteProduit === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteProduit === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteProduit === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteProduit === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Respect des engagements de livraison</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectLivraison === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectLivraison === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectLivraison === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectLivraison === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Documentation jointe au produit</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.documentationProduit === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.documentationProduit === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.documentationProduit === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.documentationProduit === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Respect des spécifications</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectSpecifications === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectSpecifications === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectSpecifications === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.respectSpecifications === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                        <br>${avis.presentationcomm === null ? "" : "  "+avis.presentationcomm}
                    </p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 86pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Concernant le SAV</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Conformité à vos besoins</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteBesoins === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteBesoins === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteBesoins === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.conformiteBesoins === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Respect des délais d'intervention</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaisintervention === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaisintervention === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaisintervention === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.delaisintervention === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                      ${avis.savcomm === null ? "" : "  "+avis.savcomm}

                    </p>
                </td>
            </tr>
            <tr style="height:11pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s7" style="padding-left: 27pt;text-indent: 0pt;line-height: 10pt;text-align: left;">Concernant les éléments non contractuels</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;padding-right: 2pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▲▲</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s8" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">►</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p class="s9" style="padding-left: 4pt;text-indent: 0pt;line-height: 9pt;text-align: center;">▼</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Accueil téléphonique</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.accueilTelephonique === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.accueilTelephonique === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.accueilTelephonique === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.accueilTelephonique === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Qualité relationnelle</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteRelationnelle === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteRelationnelle === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteRelationnelle === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteRelationnelle === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Réactivité</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactivite === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactivite === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactivite === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.reactivite === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:12pt">
                <td style="width:259pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-left: 1pt;text-indent: 0pt;line-height: 11pt;text-align: left;">Qualité du site Internet</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteSite === "4" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteSite === "3" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteSite === "2" ? "X" : "" }</p>
                </td>
                <td style="width:43pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                    <p style="text-indent: 0pt;text-align: center;">${avis.qualiteSite === "1" ? "X" : "" }</p>
                </td>
            </tr>
            <tr style="height:23pt">
                <td style="width:130pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                    <p class="s11" style="padding-top: 4pt;padding-left: 23pt;text-indent: 0pt;text-align: left;">Vos commentaires</p>
                </td>
                <td style="width:301pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="4">
                    <p style="text-indent: 0pt;text-align: left;">
                         ${avis.elementcomm === null ? "" : "  "+avis.elementcomm}

                    </p>
                </td>
            </tr>
            <tr style="height:115pt;">
                <td style="width:487pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt" colspan="7">
                    <p style="text-indent: 0pt;text-align: left;">
                        <br>
                    </p>
                    <p class="s11" style="padding-left: 50pt;text-indent: 0pt;text-align: left;">Client : ${avis.visa} Nom et Prénom: ${avis.nomPrenom }</p>
                    <table style="border-collapse:collapse;margin-left:50pt" cellspacing="0">
                        <tbody>
                            <tr style="height:11pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                                    <p class="s7" style="padding-left: 1pt;text-indent: 0pt;line-height: 10pt;text-align: center;">Point Fort</p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:2pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                                    <p class="s7" style="text-indent: 0pt;line-height: 10pt;text-align: center;">Poin Faible</p>
                                </td>
                            </tr>
                            <tr style="height:12pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFort1 === null ? "" : "  "+avis.pointFort1}
                                    </p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFaible1 === null ? "" : "  "+avis.pointFaible1}
                                    </p>
                                </td>
                            </tr>
                            <tr style="height:12pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                      ${avis.pointFort2 === null ? "" : "  "+avis.pointFort2}

                                    </p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFaible2 === null ? "" : "  "+avis.pointFaible2}
                                    </p>
                                </td>
                            </tr>
                            <tr style="height:12pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFort3 === null ? "" : "  "+avis.pointFort3}
                                    </p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFaible3 === null ? "" : "  "+avis.pointFaible3}
                                    </p>
                                </td>
                            </tr>
                            <tr style="height:12pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:1pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFort4 === null ? "" : "  "+avis.pointFort4}
                                    </p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:1pt;border-right-style:solid;border-right-width:2pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFaible4 === null ? "" : "  "+avis.pointFaible4}
                                    </p>
                                </td>
                            </tr>
                            <tr style="height:14pt">
                                <td style="width:216pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:2pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:1pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFort5 === null ? "" : "  "+avis.pointFort5}
                                    </p>
                                </td>
                                <td style="width:215pt;border-top-style:solid;border-top-width:1pt;border-left-style:solid;border-left-width:1pt;border-bottom-style:solid;border-bottom-width:2pt;border-right-style:solid;border-right-width:2pt">
                                    <p style="text-indent: 0pt;text-align: left;">
                                        ${avis.pointFaible5 === null ? "" : "  "+avis.pointFaible5}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    <p style="text-indent: 0pt;text-align: left;"></p>
    <p style="text-indent: 0pt;text-align: left;">
    </p>
    <script>
        window.onload = function() {
                    window.print();
                };
    </script>
</body>

</html>

    `;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    }


    deleteAvis(id: number) {
        this.avisService.deleteAvis(id).subscribe(
            () => {
                console.log('Avis deleted');
                this.loadAvis(); // Refresh the list after deletion
            },
            error => {
                console.error('Error deleting avis', error);
            }
        );
    }

    searchAvis(): void {
        if (this.searchTerm.trim() === '') {
            this.loadAvis();
        } else {
            this.avisList = this.avisList.filter(avis =>
                avis.nomPrenom.toLowerCase().includes(this.searchTerm.toLowerCase())

        );
        }
    }

     fetchUserProfile(email: string): void {
        this.usersService.getUserByEmail(email).subscribe(
            (data) => {
                this.user = data;
            },
            (error) => {
                console.error('Error fetching user data', error);
                this.errorMessage = 'Error fetching user data. Please try again later.';
            }
        );
    }

     fetchWorkerProfile(email: string): void {
        this.workersService.getWorkerByEmail(email).subscribe(
            (data) => {
                this.user = data;
            },
            (error) => {
                console.error('Error fetching worker data', error);
                this.errorMessage = 'Error fetching worker data. Please try again later.';
            }
        );
    }

    onSearchInputChange(): void {
        this.searchAvis();
    }
}