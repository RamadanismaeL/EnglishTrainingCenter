/*
*@author Ramadan Ismael
*/

using server.src.DTOs;
using server.src.Models;

namespace server.src.Interfaces
{
    public interface IRoleRepository
    {
        Task<ResponseDto> Create(RoleCreateDto roleCreateDto);
        Task<IEnumerable<RoleDetailDto>> Details();
        Task<ResponseDto> Update(RoleUpdateDto roleUpdateDto, string id);
        Task<ResponseDto> Delete(string id);
        Task<ResponseDto> Assign(RoleAssignDto roleAssignDto);
    }
}