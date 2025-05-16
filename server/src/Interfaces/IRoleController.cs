/*
*@author Ramadan Ismael
*/

using Microsoft.AspNetCore.Mvc;
using server.src.DTOs;

namespace server.src.Interfaces
{
    public interface IRoleController
    {
        Task<IActionResult> Create([FromBody] RoleCreateDto roleCreateDto);
        Task<ActionResult<IEnumerable<RoleDetailDto>>> Details();
        Task<IActionResult> Update(string id, [FromBody] RoleUpdateDto roleUpdateDto);
        Task<IActionResult> Delete(string id);
        Task<IActionResult> Assign([FromBody] RoleAssignDto roleAssignDto);
    }
}