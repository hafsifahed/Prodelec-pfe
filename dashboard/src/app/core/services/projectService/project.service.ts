import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProjectDto } from '../../models/projectfo/project-dto';
import { Project } from '../../models/projectfo/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }

  createProject(project: ProjectDto, idOrder: number, conceptionResponsible?: string, methodeResponsible?: string, productionResponsible?: string, finalControlResponsible?: string, deliveryResponsible?: string) {
    const url = `${environment.baseUrl}/project?idOrder=${idOrder}&conceptionResponsible=${conceptionResponsible}&methodeResponsible=${methodeResponsible}&productionResponsible=${productionResponsible}&finalControlResponsible=${finalControlResponsible}&deliveryResponsible=${deliveryResponsible}`;
    return this.http.post(url, project);
  }

  updateProject(projectId: number, updatedProject: ProjectDto, conceptionResponsible?: string, methodeResponsible?: string, productionResponsible?: string, finalControlResponsible?: string, deliveryResponsible?: string) {
    const url = `${environment.baseUrl}/project/${projectId}?conceptionResponsible=${conceptionResponsible}&methodeResponsible=${methodeResponsible}&productionResponsible=${productionResponsible}&finalControlResponsible=${finalControlResponsible}&deliveryResponsible=${deliveryResponsible}`;
    return this.http.put(url, updatedProject);
  }

  getAllProjects() {
    return this.http.get<Project[]>(`${environment.baseUrl}/project`);
  }

  getProjectById(id: number) {
    const url = `${environment.baseUrl}/project/${id}`;
    return this.http.get<Project>(url);
  }

  deleteProject(id: number) {
    const url = `${environment.baseUrl}/project/${id}`;
    return this.http.delete(url);
  }

  getProjectsByUser(userId: number) {
    const url = `${environment.baseUrl}/project/user/${userId}`;
    return this.http.get<Project[]>(url);
  }

  changeStatusConception(id: number) {
    const url = `${environment.baseUrl}/project/statusc/${id}`;
    return this.http.put(url, {});
  }

  changeStatusConception1(id: number) {
    const url = `${environment.baseUrl}/project/statusc1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusMethode(id: number) {
    const url = `${environment.baseUrl}/project/statusm/${id}`;
    return this.http.put(url, {});
  }

  changeStatusMethode1(id: number) {
    const url = `${environment.baseUrl}/project/statusm1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusProduction(id: number) {
    const url = `${environment.baseUrl}/project/statusp/${id}`;
    return this.http.put(url, {});
  }

  changeStatusProduction1(id: number) {
    const url = `${environment.baseUrl}/project/statusp1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusFC(id: number) {
    const url = `${environment.baseUrl}/project/statusfc/${id}`;
    return this.http.put(url, {});
  }

  changeStatusFC1(id: number) {
    const url = `${environment.baseUrl}/project/statusfc1/${id}`;
    return this.http.put(url, {});
  }

  changeStatusDelivery(id: number) {
    const url = `${environment.baseUrl}/project/statusd/${id}`;
    return this.http.put(url, {});
  }

  changeStatusDelivery1(id: number) {
    const url = `${environment.baseUrl}/project/statusd1/${id}`;
    return this.http.put(url, {});
  }

  progressc(id: number,p:number) {
    const url = `${environment.baseUrl}/project/progressc/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressm(id: number,p:number) {
    const url = `${environment.baseUrl}/project/progressm/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressp(id: number,p:number) {
    const url = `${environment.baseUrl}/project/progressp/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressfc(id: number,p:number) {
    const url = `${environment.baseUrl}/project/progressfc/${id}/${p}`;
    return this.http.put(url, {});
  }

  progressd(id: number,p:number) {
    const url = `${environment.baseUrl}/project/progressd/${id}/${p}`;
    return this.http.put(url, {});
  }

  changeprogress(id: number) {
    const url = `${environment.baseUrl}/project/progress/${id}`;
    return this.http.put(url, {});
  }

  archivera(id: number) {
    return this.http.put(`${environment.baseUrl}/project/archivera/${id}`, {});
  }

  archiverc(id: number) {
    return this.http.put(`${environment.baseUrl}/project/archiverc/${id}`, {});
  }

  changeRealc(id: number){
    const url = `${environment.baseUrl}/project/realc/${id}`;
    return this.http.put(url,{});
  }

  changeRealm(id: number) {
    const url = `${environment.baseUrl}/project/realm/${id}`;
    return this.http.put(url, {});
  }

  changeRealp(id: number){
    const url = `${environment.baseUrl}/project/realp/${id}`;
    return this.http.put(url,{});
  }

  changeRealfc(id: number) {
    const url = `${environment.baseUrl}/project/realfc/${id}`;
    return this.http.put(url, {});
  }

  changeReall(id: number) {
    const url = `${environment.baseUrl}/project/reall/${id}`;
    return this.http.put(url,{});
  }

}
